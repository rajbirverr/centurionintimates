'use server'

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/supabase/admin'
import { sendZeptoMail, sendBulkZeptoMail } from '@/lib/email/zeptomail'

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  subscribed_at: string
  is_active: boolean
}

export interface NewsletterSend {
  id: string
  template_type: string
  recipient_email: string
  subject: string
  sent_at: string
  status: 'sent' | 'failed' | 'bounced'
  error_message?: string
}

export interface NewsletterData {
  // Welcome
  userName?: string
  signupDate?: string
  
  // Order Confirmation
  orderNumber?: string
  orderDate?: string
  items?: Array<{ name: string; quantity: number; price: number }>
  total?: number
  
  // Shipping Confirmation
  trackingNumber?: string
  estimatedDelivery?: string
  
  // Cart Reminder
  cartItems?: Array<{ name: string; price: number; image?: string }>
  
  // Sale
  salePercentage?: number
  saleEndDate?: string
  featuredProducts?: Array<{ name: string; price: number; image?: string }>
  
  // Festival
  festivalName?: string
  festivalDate?: string
  
  // Blog Post
  blogTitle?: string
  blogExcerpt?: string
  blogUrl?: string
  
  // Invoice
  billingInfo?: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  subtotal?: number
  tax?: number
}

/**
 * Get all active newsletter subscribers
 */
export async function getSubscribers(): Promise<{ success: boolean; data?: NewsletterSubscriber[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscribers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error in getSubscribers:', error)
    return { success: false, error: error.message || 'Failed to fetch subscribers' }
  }
}

/**
 * Add email to newsletter subscribers
 */
export async function addSubscriber(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[NEWSLETTER] addSubscriber called for:', email.toLowerCase())
    const supabase = await createServerSupabaseClient()
    
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      console.log('[NEWSLETTER] Email already exists, is_active:', existing.is_active)
      if (existing.is_active) {
        console.log('[NEWSLETTER] Email already active - skipping welcome email')
        return { success: true } // Already subscribed
      } else {
        // Reactivate subscription
        const { error } = await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id)

        if (error) throw error
        
        // Send welcome email on reactivation (optional - you can remove this if not needed)
        try {
          const welcomeData: NewsletterData = {
            userName: name || email.split('@')[0],
            signupDate: new Date().toLocaleDateString()
          }
          
          await sendWelcomeEmailInternal(email.toLowerCase(), welcomeData)
        } catch (emailError: any) {
          console.error('Failed to send welcome email:', emailError)
        }
        
        return { success: true }
      }
    }

    // Add new subscriber
    console.log('[NEWSLETTER] Adding new subscriber to database...')
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        is_active: true
      })

    if (error) {
      console.error('[NEWSLETTER] Database insert error:', error)
      throw error
    }
    
    console.log('[NEWSLETTER] Subscriber added successfully, now sending welcome email...')

    // Automatically send welcome email to new subscribers
    try {
      console.log('[NEWSLETTER] Attempting to send welcome email to:', email.toLowerCase())
      const welcomeData: NewsletterData = {
        userName: name || email.split('@')[0],
        signupDate: new Date().toLocaleDateString()
      }
      
      const emailResult = await sendWelcomeEmailInternal(email.toLowerCase(), welcomeData)
      
      if (emailResult.success) {
        console.log('[NEWSLETTER] Welcome email sent successfully to:', email.toLowerCase())
      } else {
        console.error('[NEWSLETTER] Failed to send welcome email:', emailResult.error)
        // Log failure to database
        try {
          const supabase = await createServerSupabaseClient()
          await supabase.from('newsletter_sends').insert({
            template_type: 'welcome',
            recipient_email: email.toLowerCase(),
            subject: 'Welcome to Centurion!',
            status: 'failed',
            error_message: emailResult.error || 'Unknown error'
          })
        } catch (logError) {
          console.error('[NEWSLETTER] Failed to log email failure:', logError)
        }
      }
    } catch (emailError: any) {
      // Log error but don't fail subscription if email fails
      console.error('[NEWSLETTER] Exception sending welcome email:', emailError)
      // Log to database
      try {
        const supabase = await createServerSupabaseClient()
        await supabase.from('newsletter_sends').insert({
          template_type: 'welcome',
          recipient_email: email.toLowerCase(),
          subject: 'Welcome to Centurion!',
          status: 'failed',
          error_message: emailError.message || 'Exception occurred'
        })
      } catch (logError) {
        console.error('[NEWSLETTER] Failed to log exception:', logError)
      }
    }

    console.log('[NEWSLETTER] addSubscriber completed successfully')
    return { success: true }
  } catch (error: any) {
    console.error('[NEWSLETTER] Error adding subscriber:', error)
    return { success: false, error: error.message || 'Failed to add subscriber' }
  }
}

/**
 * Remove email from newsletter subscribers
 */
export async function removeSubscriber(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        is_active: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error removing subscriber:', error)
    return { success: false, error: error.message || 'Failed to remove subscriber' }
  }
}

/**
 * Render newsletter template to HTML string
 */
function renderNewsletterTemplate(
  type: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice',
  data?: NewsletterData
): string {
  // For server-side rendering, we'll create a simplified HTML version
  // In a real implementation, you might want to use a proper HTML email template library
  // For now, we'll return a placeholder that can be enhanced
  
  // Use production URL if available, otherwise use localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://centurionshoppe.com' 
                    : 'http://localhost:3000')
  
  // This is a simplified version - in production, you'd want proper HTML email templates
  // that work across all email clients
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Centurion Newsletter</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #fafafa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <header style="background-color: white; border-bottom: 1px solid #e8ded0; padding: 24px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: bold; color: #5a4c46; margin: 0; letter-spacing: 2px;">CENTURION</h1>
            <div style="width: 64px; height: 2px; background-color: #784D2C; margin: 4px auto 0;"></div>
          </header>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            ${getTemplateContentHTML(type, data, baseUrl)}
          </div>
          
          <!-- Footer -->
          <footer style="background-color: #fafafa; border-top: 1px solid #e8ded0; padding: 32px 24px; text-align: center;">
            <p style="font-size: 12px; color: #84756f; margin: 0 0 16px;">
              You're receiving this email because you subscribed to Centurion newsletters.
            </p>
            <p style="font-size: 12px; color: #84756f; margin: 0;">
              <a href="${baseUrl}/unsubscribe" style="color: #84756f; text-decoration: underline;">Unsubscribe</a> | 
              <a href="${baseUrl}" style="color: #84756f; text-decoration: underline; margin-left: 4px;">Visit Website</a>
            </p>
            <p style="font-size: 12px; color: #84756f; margin: 16px 0 0;">
              © ${new Date().getFullYear()} Centurion. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  `
}

/**
 * Get HTML content for each template type
 */
function getTemplateContentHTML(
  type: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice',
  data?: NewsletterData
): string {
  // Use production URL if available, otherwise use localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://centurionshoppe.com' 
                    : 'http://localhost:3000')
  
  switch (type) {
    case 'welcome':
      return `
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 32px; font-weight: bold; color: #5a4c46; margin: 0 0 16px;">Welcome to Centurion</h2>
          <p style="font-size: 16px; color: #84756f; margin: 0 0 24px;">
            We're thrilled to have you join our community of jewelry lovers
          </p>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="font-size: 16px; color: #5a4c46; line-height: 1.6; margin: 0 0 16px;">
            Thank you for subscribing! You're now part of an exclusive community that celebrates beauty, empowerment, and timeless elegance.
          </p>
          <p style="font-size: 14px; color: #84756f; margin: 0;">
            Get ready to discover handcrafted jewelry that's playful, pretty, and totally extra.
          </p>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${baseUrl}/all-products" 
             style="display: inline-block; background-color: #5a4c46; color: white; padding: 12px 32px; text-decoration: none; border-radius: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Start Shopping
          </a>
        </div>
      `
    
    case 'sale':
      return `
        <div style="background-color: #E91E63; color: white; text-align: center; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="font-size: 32px; font-weight: bold; margin: 0 0 8px;">SALE NOW ON</h2>
          <p style="font-size: 18px; margin: 0;">Up to ${data?.salePercentage || 50}% off selected items</p>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <h3 style="font-size: 24px; font-weight: 500; color: #5a4c46; margin: 0 0 16px;">Limited Time Offer</h3>
          <p style="font-size: 16px; color: #84756f; margin: 0;">
            Don't miss out on our biggest sale of the season. Shop now before it's too late!
          </p>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${baseUrl}/sale" 
             style="display: inline-block; background-color: #E91E63; color: white; padding: 12px 32px; text-decoration: none; border-radius: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Shop Sale
          </a>
        </div>
      `
    
    case 'order-confirmation':
      return `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background-color: #784D2C; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 32px;">✓</span>
          </div>
          <h2 style="font-size: 28px; font-weight: 500; color: #5a4c46; margin: 0 0 8px;">Order Confirmed!</h2>
          <p style="font-size: 16px; color: #84756f; margin: 0;">Thank you for your purchase</p>
        </div>
        <div style="background-color: #fafafa; border: 1px solid #e8ded0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; color: #84756f;">Order Number:</span>
            <span style="font-size: 14px; font-weight: 500; color: #5a4c46;">#${data?.orderNumber || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; color: #84756f;">Order Date:</span>
            <span style="font-size: 14px; font-weight: 500; color: #5a4c46;">${data?.orderDate || new Date().toLocaleDateString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e8ded0; padding-top: 12px; margin-top: 12px;">
            <span style="font-size: 14px; color: #84756f;">Total Amount:</span>
            <span style="font-size: 14px; font-weight: 500; color: #5a4c46;">₹${data?.total?.toLocaleString() || '0'}</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${baseUrl}/account?tab=orders" 
             style="display: inline-block; background-color: #5a4c46; color: white; padding: 12px 32px; text-decoration: none; border-radius: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            View Order
          </a>
        </div>
      `
    
    case 'cart-reminder':
      return `
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 28px; font-weight: 500; color: #5a4c46; margin: 0 0 8px;">Don't Forget Your Items!</h2>
          <p style="font-size: 16px; color: #84756f; margin: 0;">You left some beautiful pieces in your cart</p>
        </div>
        <div style="background-color: #fafafa; border: 1px solid #e8ded0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          ${data?.cartItems?.map(item => `
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div style="width: 80px; height: 80px; border-radius: 8px; flex-shrink: 0; overflow: hidden; background-color: #d4cdc3;">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
              </div>
              <div style="flex: 1;">
                <h4 style="font-size: 14px; font-weight: 500; color: #5a4c46; margin: 0 0 4px;">${item.name}</h4>
                <p style="font-size: 12px; color: #84756f; margin: 0;">₹${item.price.toLocaleString()}</p>
              </div>
            </div>
          `).join('') || '<p style="color: #84756f;">Your cart items</p>'}
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${baseUrl}/cart" 
             style="display: inline-block; background-color: #5a4c46; color: white; padding: 12px 32px; text-decoration: none; border-radius: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Complete Purchase
          </a>
        </div>
      `
    
    default:
      return `<p style="color: #5a4c46;">Newsletter content for ${type}</p>`
  }
}

/**
 * Send welcome email (public - no admin auth required)
 * Used for automatic welcome emails when users subscribe
 */
async function sendWelcomeEmailInternal(
  recipient: string,
  data?: NewsletterData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[NEWSLETTER] sendWelcomeEmailInternal called for:', recipient)
    const emailSubject = 'Welcome to Centurion!'
    const htmlBody = renderNewsletterTemplate('welcome', data)
    
    console.log('[NEWSLETTER] Calling sendZeptoMail...')
    const result = await sendZeptoMail({
      to: recipient,
      subject: emailSubject,
      htmlBody
    })
    
    console.log('[NEWSLETTER] sendZeptoMail result:', result)

    // Log send attempt to database (whether success or failure)
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.from('newsletter_sends').insert({
        template_type: 'welcome',
        recipient_email: recipient,
        subject: emailSubject,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error || null
      })
      console.log('[NEWSLETTER] Logged send attempt to database')
    } catch (logError: any) {
      // Don't fail if logging fails
      console.error('[NEWSLETTER] Failed to log welcome email send:', logError)
    }

    return result
  } catch (error: any) {
    console.error('[NEWSLETTER] Exception in sendWelcomeEmailInternal:', error)
    // Log exception to database
    try {
      const supabase = await createServerSupabaseClient()
      await supabase.from('newsletter_sends').insert({
        template_type: 'welcome',
        recipient_email: recipient,
        subject: 'Welcome to Centurion!',
        status: 'failed',
        error_message: error.message || 'Exception in sendWelcomeEmailInternal'
      })
    } catch (logError) {
      console.error('[NEWSLETTER] Failed to log exception:', logError)
    }
    return { success: false, error: error.message || 'Failed to send welcome email' }
  }
}

/**
 * Get cart items for a user by email (for cart reminder emails)
 */
async function getCartItemsByEmail(email: string): Promise<NewsletterData['cartItems']> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminSupabase = createAdminClient()
  
  // Find user by email using admin client - list all users and find by email
  const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers()
  if (listError) {
    throw new Error(`Failed to find user: ${listError.message}`)
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!user) {
    throw new Error(`User with email ${email} not found. Make sure the user is registered.`)
  }

  const userId = user.id

  // Get cart items for this user using admin client (bypasses RLS)
  const { data: cartItems, error: cartError } = await adminSupabase
    .from('cart_items')
    .select('product_name, product_price, quantity, product_image')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (cartError) {
    throw new Error(`Failed to fetch cart items: ${cartError.message}`)
  }

  if (!cartItems || cartItems.length === 0) {
    return []
  }

  return cartItems.map(item => ({
    name: item.product_name,
    price: Number(item.product_price) * item.quantity,
    image: item.product_image || undefined
  }))
}

/**
 * Send newsletter email
 */
export async function sendNewsletter(
  templateType: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice',
  recipients: string[],
  subject?: string,
  data?: NewsletterData
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, sent: 0, failed: 0, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, sent: 0, failed: 0, error: 'Admin access required' }
    }

    // Generate subject line if not provided
    const emailSubject = subject || getDefaultSubject(templateType, data)

    // Send emails
    const supabase = await createServerSupabaseClient()
    let sentCount = 0
    let failedCount = 0
    let lastError: string | undefined

    for (const recipient of recipients) {
      try {
        // For cart-reminder emails, fetch real cart data if not provided
        let emailData = data
        if (templateType === 'cart-reminder' && (!data || !data.cartItems)) {
          try {
            const cartItems = await getCartItemsByEmail(recipient)
            emailData = { ...data, cartItems }
          } catch (cartError: any) {
            throw new Error(`Failed to get cart data for ${recipient}: ${cartError.message}`)
          }
        }

        // Render HTML template with real data
        const htmlBody = renderNewsletterTemplate(templateType, emailData)

        const result = await sendZeptoMail({
          to: recipient,
          subject: emailSubject,
          htmlBody
        })

        // Log send attempt
        await supabase.from('newsletter_sends').insert({
          template_type: templateType,
          recipient_email: recipient,
          subject: emailSubject,
          status: result.success ? 'sent' : 'failed',
          error_message: result.error || null
        })

        if (result.success) {
          sentCount++
        } else {
          failedCount++
          lastError = result.error || 'Email sending failed'
        }
      } catch (error: any) {
        failedCount++
        lastError = error.message || String(error)
        
        try {
          await supabase.from('newsletter_sends').insert({
            template_type: templateType,
            recipient_email: recipient,
            subject: emailSubject,
            status: 'failed',
            error_message: lastError
          })
        } catch (logError) {
          // Ignore logging errors
        }
      }
    }
    
    console.log(`[NEWSLETTER] Send complete. Sent: ${sentCount}, Failed: ${failedCount}`)

    return {
      success: sentCount > 0,
      sent: sentCount,
      failed: failedCount,
      error: failedCount > 0 && sentCount === 0 ? (lastError || 'Failed to send newsletter') : undefined
    }
  } catch (error: any) {
    console.error('Error in sendNewsletter:', error)
    return { success: false, sent: 0, failed: 0, error: error.message || 'Failed to send newsletter' }
  }
}

/**
 * Get default subject line for template type
 */
function getDefaultSubject(
  type: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice',
  data?: NewsletterData
): string {
  const subjects: Record<string, string> = {
    'welcome': 'Welcome to Centurion!',
    'sale': 'Limited Time Sale - Up to 50% Off',
    'festival': 'Festival Collection - Celebrate in Style',
    'blog-post': 'Latest from The Centurion Edit',
    'order-confirmation': `Order Confirmation #${data?.orderNumber || ''}`,
    'cart-reminder': "Don't Forget Your Cart Items!",
    'invoice': `Invoice #${data?.orderNumber || ''}`
  }
  return subjects[type] || 'Newsletter from Centurion'
}

/**
 * Get newsletter send history
 */
export async function getSendHistory(limit: number = 50): Promise<{ success: boolean; data?: NewsletterSend[]; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Admin access required' }
    }

    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('newsletter_sends')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching send history:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error in getSendHistory:', error)
    return { success: false, error: error.message || 'Failed to fetch send history' }
  }
}
