# Newsletter System Setup Guide

## Overview

The newsletter system allows you to send automated and manual marketing emails to your subscribers using ZeptoMail. It supports 7 different template types and can be managed from the admin panel.

## Prerequisites

1. ZeptoMail account with verified domain (centurionshoppe.com)
2. ZeptoMail API key
3. Database schema setup

## Environment Variables

Add these to your `.env.local` file:

```env
# ZeptoMail Configuration
ZEPTOMAIL_API_KEY=your_zeptomail_api_key_here
ZEPTOMAIL_FROM_EMAIL=noreply@centurionshoppe.com
ZEPTOMAIL_FROM_NAME=Centurion

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# In production, use: https://yourdomain.com
```

## Database Setup

1. Go to your Supabase SQL Editor
2. Run the SQL script: `supabase-newsletter-schema.sql`
3. This creates:
   - `newsletter_subscribers` table
   - `newsletter_sends` table (for logging)
   - RLS policies for security
   - Indexes for performance

## Getting Your ZeptoMail API Key

1. Log in to your ZeptoMail dashboard
2. Go to **Settings** → **API Keys**
3. Copy your API key
4. Add it to `.env.local` as `ZEPTOMAIL_API_KEY`

## Using the Newsletter System

### Admin Panel

1. Navigate to `/admin/newsletter`
2. You'll see 7 template cards:
   - **Welcome Email** - For new subscribers
   - **Sale Newsletter** - Promotional sales
   - **Festival Collection** - Festival-themed emails
   - **Blog Post** - Share blog updates
   - **Order Confirmation** - Automated (after payment integration)
   - **Cart Reminder** - Abandoned cart emails
   - **Invoice** - Automated (after payment integration)

3. Click any template to open the send modal
4. Choose recipients:
   - All subscribers
   - Single email
   - Custom list (comma/newline separated)
5. Customize subject line
6. Click "Send Newsletter"

### Viewing Send History

- Click the "Send History" tab in the admin panel
- View all sent emails with status (sent/failed/bounced)
- Check recipient emails and timestamps

## Newsletter Templates

Templates are located at:
- **Web Preview**: `/newsletter/[type]` (e.g., `/newsletter/welcome`)
- **Email HTML**: Generated server-side in `src/lib/actions/newsletter.ts`

### Template Types

1. **welcome** - Welcome new subscribers
2. **sale** - Sales and promotions
3. **festival** - Festival collections
4. **blog-post** - Blog updates
5. **order-confirmation** - Order confirmations (automated)
6. **cart-reminder** - Abandoned cart reminders
7. **invoice** - Order invoices (automated)

## Automated Emails (Future Implementation)

Once payment gateway and shipping APIs are integrated:

### Order Confirmation
- Hook into: `src/lib/actions/orders.ts` → `createOrder()`
- Trigger: After successful payment
- Template: `order-confirmation`
- Data: Order details, items, total

### Shipping Confirmation
- Hook into: Order status update function
- Trigger: When order status changes to 'shipped'
- Template: `shipping-confirmation` (to be created)
- Data: Order number, tracking number, estimated delivery

### Welcome Email
- Hook into: `src/lib/actions/auth.ts` → `signUp()`
- Trigger: After user signs up
- Template: `welcome`
- Data: User name, signup date

### Cart Reminder
- Create scheduled job to check abandoned carts
- Trigger: 24 hours after cart creation with no checkout
- Template: `cart-reminder`
- Data: Cart items, total

## Newsletter Subscription (Footer)

The footer newsletter subscription form automatically:
- Adds subscribers to the database
- Shows success/error messages
- Validates email format
- Prevents duplicate subscriptions

## Testing

1. **Test Email Sending:**
   - Go to `/admin/newsletter`
   - Select a template
   - Send to your own email address
   - Check inbox for the email

2. **Test Subscription:**
   - Go to homepage footer
   - Enter email and subscribe
   - Check admin panel to see subscriber added

3. **Test Template Preview:**
   - Visit `/newsletter/welcome` (or any template type)
   - Verify template renders correctly

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   - Verify `ZEPTOMAIL_API_KEY` is set correctly
   - Check ZeptoMail dashboard for API key status

2. **Check Domain Verification:**
   - Ensure `centurionshoppe.com` is verified in ZeptoMail
   - Check DNS records are correct

3. **Check Error Logs:**
   - Check browser console for errors
   - Check server logs for API errors
   - Check `newsletter_sends` table for failed sends

### Database Errors

1. **Tables Not Found:**
   - Run `supabase-newsletter-schema.sql` again
   - Check Supabase dashboard for table existence

2. **Permission Errors:**
   - Verify RLS policies are enabled
   - Check admin role in `profiles` table

## API Reference

### Server Actions

```typescript
// Get all subscribers
const result = await getSubscribers()

// Add subscriber
const result = await addSubscriber(email, name?)

// Remove subscriber
const result = await removeSubscriber(email)

// Send newsletter
const result = await sendNewsletter(
  templateType,
  recipients: string[],
  subject?,
  data?
)

// Get send history
const result = await getSendHistory(limit?)
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run database schema
3. ✅ Test email sending
4. ⏳ Integrate automated triggers (after payment/shipping)
5. ⏳ Set up cart abandonment tracking
6. ⏳ Add email analytics (if ZeptoMail supports webhooks)

## Support

For ZeptoMail API issues, refer to:
- [ZeptoMail Documentation](https://www.zeptomail.com/docs/api/)
- ZeptoMail Dashboard → Help & Support
