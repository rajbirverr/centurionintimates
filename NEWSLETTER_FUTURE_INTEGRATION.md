# Newsletter System - Future Integration Guide

## Current Status ✅

The newsletter system is **fully functional** and ready to use:
- ✅ Footer subscription working
- ✅ Automatic welcome emails on subscription
- ✅ Admin newsletter panel at `/admin/newsletter`
- ✅ 7 template types available
- ✅ Email sending via ZeptoMail API
- ✅ Send history tracking
- ✅ Database schema set up

## Future Integration Points (When Payment/Shipping Ready)

### 1. Order Confirmation Email

**Location:** `src/lib/actions/orders.ts`

**Function to modify:** `createOrder()`

**Integration point:**
```typescript
// After successful order creation, add:
import { sendNewsletter } from '@/lib/actions/newsletter'

// Inside createOrder(), after order is successfully created:
if (orderId && payment_status === 'paid') {
  // Send order confirmation email
  await sendNewsletter(
    'order-confirmation',
    [customer_email],
    `Order Confirmation #${orderNumber}`,
    {
      orderNumber: orderNumber,
      orderDate: new Date().toLocaleDateString(),
      items: orderItems.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price
      })),
      total: total
    }
  )
}
```

### 2. Shipping Confirmation Email

**Location:** Order status update function (likely in `src/lib/actions/orders.ts`)

**Integration point:**
```typescript
// When order status changes to 'shipped', add:
import { sendNewsletter } from '@/lib/actions/newsletter'

// After updating order status to 'shipped':
if (newStatus === 'shipped') {
  await sendNewsletter(
    'shipping-confirmation', // Note: This template needs to be created
    [order.customer_email],
    `Your Order #${orderNumber} Has Shipped!`,
    {
      orderNumber: orderNumber,
      trackingNumber: trackingNumber, // From shipping API
      estimatedDelivery: estimatedDelivery // From shipping API
    }
  )
}
```

### 3. Invoice Email

**Location:** `src/lib/actions/orders.ts` → `createOrder()`

**Integration point:**
```typescript
// Send invoice along with order confirmation:
await sendNewsletter(
  'invoice',
  [customer_email],
  `Invoice #${orderNumber}`,
  {
    orderNumber: orderNumber,
    billingInfo: {
      name: customer_name,
      address: billing_address.address,
      city: billing_address.city,
      state: billing_address.state,
      zip: billing_address.zip
    },
    subtotal: subtotal,
    tax: tax,
    total: total
  }
)
```

### 4. Cart Reminder Email

**Location:** Create new scheduled job or cron function

**New file to create:** `src/lib/actions/cart-reminder.ts`

**Implementation:**
```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendNewsletter } from '@/lib/actions/newsletter'

export async function checkAbandonedCarts() {
  const supabase = await createServerSupabaseClient()
  
  // Get carts older than 24 hours with no checkout
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data: abandonedCarts } = await supabase
    .from('cart_items')
    .select(`
      *,
      profiles!inner(email)
    `)
    .lt('created_at', twentyFourHoursAgo)
    .eq('checked_out', false)
  
  // Send reminder emails
  for (const cart of abandonedCarts || []) {
    await sendNewsletter(
      'cart-reminder',
      [cart.profiles.email],
      "Don't Forget Your Cart Items!",
      {
        cartItems: cart.items.map(item => ({
          name: item.product_name,
          price: item.price
        }))
      }
    )
  }
}
```

**Schedule:** Set up a cron job or scheduled function to run `checkAbandonedCarts()` daily

## Files Ready for Integration

### Already Created:
- ✅ `src/lib/actions/newsletter.ts` - Contains `sendNewsletter()` function
- ✅ `src/lib/email/zeptomail.ts` - Email sending infrastructure
- ✅ All 7 newsletter templates (including `order-confirmation` and `invoice`)
- ✅ Database logging in `newsletter_sends` table

### Templates Available:
1. ✅ `welcome` - Already working on subscription
2. ✅ `sale` - Ready for manual sends
3. ✅ `festival` - Ready for manual sends
4. ✅ `blog-post` - Ready for manual sends
5. ✅ `order-confirmation` - Ready for payment integration
6. ✅ `cart-reminder` - Ready for cart abandonment tracking
7. ✅ `invoice` - Ready for payment integration

### Template to Create:
- ⏳ `shipping-confirmation` - Needs to be added to:
  - `src/components/newsletter/NewsletterTemplate.tsx`
  - `src/lib/actions/newsletter.ts` → `renderNewsletterTemplate()`
  - `src/app/newsletter/[type]/page.tsx` → `newsletterTypes` array

## Quick Reference

### Send Newsletter Function Signature:
```typescript
sendNewsletter(
  templateType: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice',
  recipients: string[],
  subject?: string,
  data?: NewsletterData
): Promise<{ success: boolean; sent: number; failed: number; error?: string }>
```

### NewsletterData Interface:
```typescript
interface NewsletterData {
  // Order Confirmation
  orderNumber?: string
  orderDate?: string
  items?: Array<{ name: string; quantity: number; price: number }>
  total?: number
  
  // Shipping Confirmation
  trackingNumber?: string
  estimatedDelivery?: string
  
  // Cart Reminder
  cartItems?: Array<{ name: string; price: number }>
  
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
```

## Testing Checklist (When Ready)

- [ ] Test order confirmation email after successful payment
- [ ] Test shipping confirmation when order status changes to 'shipped'
- [ ] Test invoice email with billing information
- [ ] Test cart reminder for abandoned carts (24hr delay)
- [ ] Verify all emails are logged in `newsletter_sends` table
- [ ] Check email delivery in actual inbox
- [ ] Verify email content displays correctly

## Notes

- All email sending is logged to `newsletter_sends` table automatically
- Failed emails are logged with error messages for debugging
- Welcome emails already work automatically on subscription
- Admin can manually send any template from `/admin/newsletter`
- All templates are previewable at `/newsletter/[type]`

## When You Return

1. Open this file: `NEWSLETTER_FUTURE_INTEGRATION.md`
2. Review the integration points above
3. Implement the hooks in the order/payment functions
4. Test each email type
5. Set up cart abandonment tracking if needed

The infrastructure is ready - you just need to add the function calls at the right points in your payment/shipping flow!
