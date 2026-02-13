'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AdminReview {
    id: string
    product_id: string
    user_id: string
    rating: number
    title: string
    content: string
    author_name: string
    status: 'pending' | 'approved' | 'rejected' | 'hidden'
    is_verified_purchase: boolean
    helpful_yes: number
    helpful_no: number
    created_at: string
    admin_response?: string
    product?: {
        name: string
        slug: string
        images: string[]
    }
}

export async function fetchAdminReviews(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
) {
    try {
        const supabase = await createServerSupabaseClient()

        // Calculate offset
        const from = (page - 1) * limit
        const to = from + limit - 1

        let query = supabase
            .from('reviews')
            .select(`
        *,
        product:products(name, slug, images)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,author_name.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching admin reviews:', error)
            return { success: false, error: error.message }
        }

        return {
            success: true,
            reviews: data as AdminReview[],
            total: count || 0,
            totalPages: count ? Math.ceil(count / limit) : 0
        }
    } catch (error: any) {
        console.error('Error in fetchAdminReviews:', error)
        return { success: false, error: error.message }
    }
}

export async function updateReviewStatus(reviewId: string, status: string) {
    try {
        const supabase = await createServerSupabaseClient()

        const { error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', reviewId)

        if (error) throw error

        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteReview(reviewId: string) {
    try {
        const supabase = await createServerSupabaseClient()

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)

        if (error) throw error

        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function toggleVerifyReview(reviewId: string, isVerified: boolean) {
    try {
        const supabase = await createServerSupabaseClient()

        const { error } = await supabase
            .from('reviews')
            .update({ is_verified_purchase: isVerified })
            .eq('id', reviewId)

        if (error) throw error

        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function replyToReview(reviewId: string, response: string) {
    try {
        const supabase = await createServerSupabaseClient()

        const { error } = await supabase
            .from('reviews')
            .update({ admin_response: response })
            .eq('id', reviewId)

        if (error) throw error

        revalidatePath('/admin/reviews')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
