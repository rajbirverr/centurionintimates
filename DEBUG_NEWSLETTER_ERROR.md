# Debug Newsletter Send Error

## What I Just Fixed

I've added extensive logging to help identify the exact error. The logs will show:
- Each step of the email sending process
- Cart data fetching (if cart-reminder)
- ZeptoMail API responses
- Any errors with full stack traces

## How to Find the Error

1. **Check your server terminal** (where you run `npm run dev`)
   - Look for lines starting with `[NEWSLETTER]`
   - The error message will be clearly logged

2. **Common Issues:**

   **Issue 1: User Not Found**
   - If the email `rajatvermauf@gmail.com` is not a registered user in your system
   - The cart reminder will still send, but without cart items
   - Look for: `[NEWSLETTER] User not found for email:`

   **Issue 2: ZeptoMail API Error**
   - Check if `ZEPTOMAIL_API_KEY` is set correctly in `.env.local`
   - Look for: `[ZEPTOMAIL]` logs showing API errors
   - Check the error message in the logs

   **Issue 3: Admin Client Error**
   - If `SUPABASE_SERVICE_ROLE_KEY` is missing or incorrect
   - Look for: `Error listing users` or admin client errors

   **Issue 4: Database Error**
   - If there's an issue with the `newsletter_sends` table
   - Look for: Database insert errors

## Next Steps

1. **Try sending the email again**
2. **Watch your server terminal** for `[NEWSLETTER]` logs
3. **Copy the error message** from the terminal
4. **Share the error** so I can fix it

## Quick Test

Try sending a **Welcome** email first (not cart-reminder) to see if the basic email sending works. This will help isolate if the issue is:
- General email sending (ZeptoMail API)
- Cart data fetching (specific to cart-reminder)

## What the Logs Will Show

```
[NEWSLETTER] Processing recipient: rajatvermauf@gmail.com
[NEWSLETTER] Fetching cart items for: rajatvermauf@gmail.com
[NEWSLETTER] Admin client created
[NEWSLETTER] Listing users to find: rajatvermauf@gmail.com
[NEWSLETTER] Found X total users
[NEWSLETTER] User found: [user-id]
[NEWSLETTER] Fetching cart items for user: [user-id]
[NEWSLETTER] Found X cart items
[NEWSLETTER] Rendering template...
[NEWSLETTER] Sending email via ZeptoMail...
[ZEPTOMAIL] Response status: 200
[NEWSLETTER] ZeptoMail result: SUCCESS
```

If any step fails, you'll see an error message with details.
