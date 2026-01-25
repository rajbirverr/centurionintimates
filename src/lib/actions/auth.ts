'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export async function signUp(data: SignUpData) {
  try {
    const supabase = await createServerSupabaseClient()

    // Sign up user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          display_name: `${data.firstName} ${data.lastName}`,
        },
      },
    })

    if (signUpError) {
      console.error('Error signing up:', signUpError)
      return { success: false, error: signUpError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Profile is automatically created by database trigger (handle_new_user)
    // We just verify it exists - if not, the trigger will create it
    // No need to manually insert - the trigger handles it reliably
    const adminClient = createAdminClient()
    
    // Update the profile with the correct data if it was auto-created by trigger
    // The trigger might create it with default values, so we update it
    const { error: updateError } = await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        display_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'customer',
      }, {
        onConflict: 'id'
      })

    if (updateError) {
      console.error('Error updating profile:', updateError)
      // Don't fail signup - profile might still exist from trigger
      // User can log in and profile will be fine
    }

    revalidatePath('/')
    return { success: true, user: authData.user }
  } catch (error: any) {
    console.error('Error in signUp:', error)
    return { success: false, error: error.message || 'Failed to create account' }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error signing in:', error)
      
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Please check your email and confirm your account before logging in.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Failed to sign in' }
    }

    // Check if user is admin - if so, redirect to admin dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    revalidatePath('/')
    return {
      success: true,
      user: data.user,
      isAdmin: profile?.role === 'admin',
    }
  } catch (error: any) {
    console.error('Error in signIn:', error)
    return { success: false, error: error.message || 'Failed to sign in' }
  }
}

export async function signOut() {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Error in signOut:', error)
    return { success: false, error: error.message || 'Failed to sign out' }
  }
}

export async function resetPassword(email: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      console.error('Error resetting password:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in resetPassword:', error)
    return { success: false, error: error.message || 'Failed to reset password' }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Error updating password:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/account')
    return { success: true }
  } catch (error: any) {
    console.error('Error in updatePassword:', error)
    return { success: false, error: error.message || 'Failed to update password' }
  }
}

/**
 * Check if current user is admin (server action)
 * Use this after login to verify admin status
 */
export async function checkAdminStatus(): Promise<{ success: boolean; isAdmin: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, isAdmin: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    return { success: true, isAdmin }
  } catch (error: any) {
    console.error('Error checking admin status:', error)
    return { success: false, isAdmin: false, error: error.message || 'Failed to check admin status' }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return { success: false, error: error.message, user: null }
    }

    return { success: true, user: user || null }
  } catch (error: any) {
    console.error('Error in getCurrentUser:', error)
    return { success: false, error: error.message || 'Failed to get user', user: null }
  }
}

