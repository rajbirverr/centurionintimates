'use server'

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProductAssociation {
    id: string
    product_id: string
    associated_product_id: string
    associated_product?: {
        id: string
        name: string
        images: string[]
        price: number
    }
    type: 'manual' | 'auto'
    score: number
    created_at: string
}

export async function getProductAssociations(productId: string) {
    try {
        const supabase = await createServerSupabaseClient()

        const { data, error } = await supabase
            .from('product_associations')
            .select(`
        *,
        associated_product:products!product_associations_associated_product_id_fkey(
          id,
          name,
          images,
          price
        )
      `)
            .eq('product_id', productId)
            .order('type', { ascending: false }) // 'manual' comes after 'auto' alphabetically, wait... 'manual' > 'auto'. We want manual first? 
            .order('score', { ascending: false })

        if (error) {
            console.error('Error fetching associations:', error)
            return { success: false, error: error.message }
        }

        // Sort manual first, then by score
        const sortedData = (data || []).sort((a, b) => {
            if (a.type === 'manual' && b.type !== 'manual') return -1
            if (a.type !== 'manual' && b.type === 'manual') return 1
            return b.score - a.score
        })

        return { success: true, associations: sortedData as ProductAssociation[] }
    } catch (error: any) {
        console.error('Error in getProductAssociations:', error)
        return { success: false, error: error.message }
    }
}

export async function addManualAssociation(productId: string, associatedProductId: string) {
    try {
        const user = await getServerUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const supabase = await createServerSupabaseClient()

        // Check if it already exists
        const { data: existing } = await supabase
            .from('product_associations')
            .select('id, type')
            .eq('product_id', productId)
            .eq('associated_product_id', associatedProductId)
            .single()

        if (existing) {
            // If auto, upgrade to manual
            if (existing.type === 'auto') {
                const { error } = await supabase
                    .from('product_associations')
                    .update({ type: 'manual', score: 100 })
                    .eq('id', existing.id)

                if (error) throw error
            }
            // If manual, do nothing (already there)
        } else {
            // Insert new manual association
            const { error } = await supabase
                .from('product_associations')
                .insert({
                    product_id: productId,
                    associated_product_id: associatedProductId,
                    type: 'manual',
                    score: 100
                })

            if (error) throw error
        }

        revalidatePath(`/admin/products/${productId}`)
        revalidatePath(`/product/${productId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Error adding manual association:', error)
        return { success: false, error: error.message }
    }
}

export async function removeAssociation(associationId: string) {
    try {
        const user = await getServerUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const supabase = await createServerSupabaseClient()

        const { error } = await supabase
            .from('product_associations')
            .delete()
            .eq('id', associationId)

        if (error) throw error

        revalidatePath('/admin/products')
        return { success: true }
    } catch (error: any) {
        console.error('Error removing association:', error)
        return { success: false, error: error.message }
    }
}

export async function refreshAutoAssociations() {
    try {
        const user = await getServerUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const supabase = await createServerSupabaseClient()

        const { error } = await supabase.rpc('calculate_frequently_bought')

        if (error) throw error

        revalidatePath('/admin/products')
        return { success: true }
    } catch (error: any) {
        console.error('Error refreshing auto associations:', error)
        return { success: false, error: error.message }
    }
}

export async function searchProducts(query: string, excludeId?: string) {
    try {
        const supabase = await createServerSupabaseClient()

        let dbQuery = supabase
            .from('products')
            .select('id, name, images, price')
            .ilike('name', `%${query}%`)
            .limit(5)

        if (excludeId) {
            dbQuery = dbQuery.neq('id', excludeId)
        }

        const { data, error } = await dbQuery

        if (error) throw error

        return { success: true, products: data }
    } catch (error: any) {
        console.error('Error searching products:', error)
        return { success: false, error: error.message }
    }
}
