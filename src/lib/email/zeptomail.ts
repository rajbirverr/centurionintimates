'use server'

/**
 * ZeptoMail API Client
 * Uses REST API for sending emails
 * Documentation: https://www.zeptomail.com/docs/api/
 */

interface ZeptoMailOptions {
  to: string | string[]
  subject: string
  htmlBody: string
  from?: {
    address: string
    name?: string
  }
  replyTo?: {
    address: string
    name?: string
  }
}

interface ZeptoMailResponse {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send email via ZeptoMail REST API
 */
export async function sendZeptoMail(options: ZeptoMailOptions): Promise<ZeptoMailResponse> {
  try {
    const apiKey = process.env.ZEPTOMAIL_API_KEY
    const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@centurionshoppe.com'
    const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'Centurion'

    console.log('[ZEPTOMAIL] API Key present:', !!apiKey)
    console.log('[ZEPTOMAIL] From Email:', fromEmail)
    console.log('[ZEPTOMAIL] From Name:', fromName)
    console.log('[ZEPTOMAIL] To:', options.to)
    console.log('[ZEPTOMAIL] Subject:', options.subject)

    if (!apiKey) {
      console.error('[ZEPTOMAIL] API key not configured - ZEPTOMAIL_API_KEY is missing or empty')
      return {
        success: false,
        error: 'Email service not configured. Please set ZEPTOMAIL_API_KEY in environment variables.'
      }
    }

    if (apiKey === 'your_zeptomail_api_key_here' || apiKey.includes('your_')) {
      console.error('[ZEPTOMAIL] API key is still a placeholder - please replace with actual key')
      return {
        success: false,
        error: 'ZeptoMail API key is still a placeholder. Please replace it with your actual API key in .env.local'
      }
    }

    // Convert single email to array
    const recipients = Array.isArray(options.to) ? options.to : [options.to]

    // Prepare email data (ZeptoMail API format)
    const emailData: any = {
      from: {
        address: options.from?.address || fromEmail
      },
      to: recipients.map(email => ({
        email_address: {
          address: email
        }
      })),
      subject: options.subject,
      htmlbody: options.htmlBody
    }

    // Add name to from if provided
    if (options.from?.name || fromName) {
      emailData.from.name = options.from?.name || fromName
    }

    // Add reply-to if provided
    if (options.replyTo) {
      emailData.reply_to = {
        address: options.replyTo.address
      }
      if (options.replyTo.name) {
        emailData.reply_to.name = options.replyTo.name
      }
    }

    // Send via ZeptoMail REST API
    console.log('[ZEPTOMAIL] Sending request to ZeptoMail API...')
    const response = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${apiKey}`
      },
      body: JSON.stringify(emailData)
    })

    console.log('[ZEPTOMAIL] Response status:', response.status, response.statusText)
    const responseData = await response.json()
    console.log('[ZEPTOMAIL] Response data:', JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      console.error('[ZEPTOMAIL] API error - Status:', response.status)
      console.error('[ZEPTOMAIL] API error - Response:', responseData)
      return {
        success: false,
        error: responseData.error?.message || responseData.message || `Failed to send email: ${response.statusText} (Status: ${response.status})`
      }
    }

    console.log('[ZEPTOMAIL] Email sent successfully! Message ID:', responseData.data?.message_id)
    return {
      success: true,
      messageId: responseData.data?.message_id || 'unknown'
    }
  } catch (error: any) {
    console.error('[ZEPTOMAIL] Exception sending email:', error)
    console.error('[ZEPTOMAIL] Error stack:', error.stack)
    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

/**
 * Send bulk emails (for newsletter campaigns)
 */
export async function sendBulkZeptoMail(
  recipients: string[],
  subject: string,
  htmlBody: string,
  from?: { address: string; name?: string }
): Promise<ZeptoMailResponse> {
  // For bulk sends, we'll send in batches to avoid rate limits
  const batchSize = 50
  const batches: string[][] = []
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize))
  }

  const results = []
  for (const batch of batches) {
    const result = await sendZeptoMail({
      to: batch,
      subject,
      htmlBody,
      from
    })
    results.push(result)
    
    // Add small delay between batches to avoid rate limiting
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Return success if all batches succeeded
  const allSuccess = results.every(r => r.success)
  return {
    success: allSuccess,
    error: allSuccess ? undefined : 'Some emails failed to send'
  }
}
