# How to Check Newsletter Email Status

## Step 1: Check Server Logs

1. Open your terminal where Next.js is running
2. Look for log messages starting with `[NEWSLETTER]` or `[ZEPTOMAIL]`
3. These will show you exactly what's happening

**What to look for:**
- `[NEWSLETTER] Attempting to send welcome email to: your@email.com` - Email function was called
- `[ZEPTOMAIL] API Key present: true/false` - Checks if API key is loaded
- `[ZEPTOMAIL] Response status: 200` - Success (200 = OK)
- `[ZEPTOMAIL] Response status: 401` - Unauthorized (wrong API key)
- `[ZEPTOMAIL] Response status: 403` - Forbidden (domain not verified)
- `[ZEPTOMAIL] API error` - Shows the actual error from ZeptoMail

## Step 2: Check Database - Newsletter Sends Table

1. Go to Supabase Dashboard → Table Editor → `newsletter_sends`
2. Look for entries with your email address
3. Check the `status` column:
   - `sent` = Email was sent successfully
   - `failed` = Email failed (check `error_message` column)
4. Check the `error_message` column for details

**SQL Query to check:**
```sql
SELECT * FROM newsletter_sends 
WHERE recipient_email = 'rajatvermauf@gmail.com' 
ORDER BY sent_at DESC 
LIMIT 10;
```

## Step 3: Check Database - Subscribers Table

1. Go to Supabase Dashboard → Table Editor → `newsletter_subscribers`
2. Verify your email is there
3. Check `is_active` is `true`

**SQL Query:**
```sql
SELECT * FROM newsletter_subscribers 
WHERE email = 'rajatvermauf@gmail.com';
```

## Step 4: Verify Environment Variables

1. Check `.env.local` file exists
2. Verify `ZEPTOMAIL_API_KEY` is set (not the placeholder)
3. Make sure you restarted the server after adding variables

**To verify in code (temporary):**
Add this to any page temporarily to check:
```typescript
console.log('API Key loaded:', !!process.env.ZEPTOMAIL_API_KEY)
console.log('API Key value (first 10 chars):', process.env.ZEPTOMAIL_API_KEY?.substring(0, 10))
```

## Step 5: Test Email Sending Manually

1. Go to `/admin/newsletter`
2. Click "Welcome Email" template
3. Select "Single email"
4. Enter: `rajatvermauf@gmail.com`
5. Click "Send Newsletter"
6. Check server logs for `[ZEPTOMAIL]` messages
7. Check `newsletter_sends` table for the entry

## Common Error Messages

### "API key not configured"
- **Cause:** `ZEPTOMAIL_API_KEY` not in `.env.local` or server not restarted
- **Fix:** Add to `.env.local` and restart server

### "API key is still a placeholder"
- **Cause:** You didn't replace `your_zeptomail_api_key_here` with actual key
- **Fix:** Replace placeholder with real API key from ZeptoMail dashboard

### "401 Unauthorized"
- **Cause:** Wrong API key
- **Fix:** Verify API key in ZeptoMail dashboard, copy exact value

### "403 Forbidden"
- **Cause:** Domain not verified in ZeptoMail
- **Fix:** Verify `centurionshoppe.com` domain in ZeptoMail dashboard

### "Failed to send email: 400 Bad Request"
- **Cause:** Invalid email format or missing required fields
- **Fix:** Check email address format and API request structure

## Quick Debug Checklist

Run through this checklist:

1. [ ] Server logs show `[NEWSLETTER] Attempting to send welcome email`
2. [ ] Server logs show `[ZEPTOMAIL] API Key present: true`
3. [ ] Server logs show `[ZEPTOMAIL] Response status: 200` (not 401/403/400)
4. [ ] Database `newsletter_sends` table has an entry with status `sent` or `failed`
5. [ ] If status is `failed`, check `error_message` column
6. [ ] `.env.local` has `ZEPTOMAIL_API_KEY` with actual key (not placeholder)
7. [ ] Server was restarted after adding environment variables
8. [ ] Email is in `newsletter_subscribers` table with `is_active = true`

## Next Steps

After checking all of the above, share:
1. What you see in server logs (the `[NEWSLETTER]` and `[ZEPTOMAIL]` messages)
2. What's in the `newsletter_sends` table (status and error_message)
3. Whether the API key is a placeholder or real value

This will help identify the exact issue.
