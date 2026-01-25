# Newsletter Email Debugging Guide

## Issue: Email Not Sending After Subscription

If you subscribed but didn't receive an email, check the following:

### 1. Check Environment Variables

Make sure these are set in `.env.local`:

```env
ZEPTOMAIL_API_KEY=your_api_key_here
ZEPTOMAIL_FROM_EMAIL=noreply@centurionshoppe.com
ZEPTOMAIL_FROM_NAME=Centurion
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**To check:**
- Open `.env.local` file in your project root
- Verify all variables are set
- Restart your Next.js dev server after adding/changing variables

### 2. Check Database Schema

Make sure the newsletter tables exist:

1. Go to Supabase Dashboard → SQL Editor
2. Run: `SELECT * FROM newsletter_subscribers LIMIT 5;`
3. If you get an error, run `supabase-newsletter-schema.sql`

### 3. Check Subscription Was Saved

1. Go to Supabase Dashboard → Table Editor → `newsletter_subscribers`
2. Look for your email (`rajatvermauf@gmail.com`)
3. Check if `is_active` is `true`

### 4. Check Email Send Logs

1. Go to Supabase Dashboard → Table Editor → `newsletter_sends`
2. Look for entries with your email
3. Check the `status` column:
   - `sent` = Email was sent successfully
   - `failed` = Email failed (check `error_message` column)

### 5. Check Server Logs

1. Open your terminal where Next.js is running
2. Look for error messages like:
   - "ZeptoMail API key not configured"
   - "Failed to send welcome email"
   - Any other error messages

### 6. Test Email Sending Manually

1. Go to `/admin/newsletter`
2. Click on "Welcome Email" template
3. Select "Single email" option
4. Enter your email: `rajatvermauf@gmail.com`
5. Click "Send Newsletter"
6. Check if you receive the email

### 7. Check ZeptoMail Dashboard

1. Log in to your ZeptoMail account
2. Go to **Activity** or **Logs** section
3. Check if emails are being sent
4. Look for any errors or blocked emails

### 8. Common Issues

#### Issue: "Email service not configured"
**Solution:** Add `ZEPTOMAIL_API_KEY` to `.env.local` and restart server

#### Issue: "Failed to send email: 401 Unauthorized"
**Solution:** 
- Check if API key is correct
- Verify API key in ZeptoMail dashboard
- Make sure there are no extra spaces in the API key

#### Issue: "Failed to send email: 403 Forbidden"
**Solution:**
- Check if domain `centurionshoppe.com` is verified in ZeptoMail
- Verify DNS records are correct

#### Issue: Email goes to spam
**Solution:**
- Check spam/junk folder
- Verify domain reputation in ZeptoMail
- Check email content for spam triggers

### 9. Test API Key Directly

You can test if your API key works by checking the ZeptoMail API:

```bash
curl -X POST https://api.zeptomail.com/v1.1/email \
  -H "Authorization: Zoho-encryption YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {
      "address": "noreply@centurionshoppe.com",
      "name": "Centurion"
    },
    "to": [{
      "email_address": {
        "address": "rajatvermauf@gmail.com"
      }
    }],
    "subject": "Test Email",
    "htmlbody": "<h1>Test</h1>"
  }'
```

### 10. Next Steps

If emails still aren't sending:

1. **Check browser console** for any JavaScript errors
2. **Check network tab** in browser DevTools for failed API calls
3. **Check Supabase logs** for database errors
4. **Verify ZeptoMail account** is active and not suspended
5. **Contact ZeptoMail support** if API key is correct but emails aren't sending

## Quick Test Checklist

- [ ] Environment variables are set
- [ ] Database tables exist
- [ ] Subscription was saved to database
- [ ] Email send was logged in `newsletter_sends` table
- [ ] No errors in server logs
- [ ] ZeptoMail API key is valid
- [ ] Domain is verified in ZeptoMail
- [ ] Test email from admin panel works
