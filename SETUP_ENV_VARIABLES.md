# Quick Setup: Add ZeptoMail Environment Variables

## Step 1: Open `.env.local` file

The file is located at: `e:\centurion-nextjs\.env.local`

## Step 2: Add these lines (if not already present)

```env
# ZeptoMail Configuration
ZEPTOMAIL_API_KEY=your_zeptomail_api_key_here
ZEPTOMAIL_FROM_EMAIL=noreply@centurionshoppe.com
ZEPTOMAIL_FROM_NAME=Centurion

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 3: Replace `your_zeptomail_api_key_here` with your actual API key

1. Go to [ZeptoMail Dashboard](https://www.zeptomail.com/)
2. Log in to your account
3. Navigate to **Settings** → **API Keys**
4. Copy your API key
5. Replace `your_zeptomail_api_key_here` in `.env.local` with your actual key

**Example:**
```env
ZEPTOMAIL_API_KEY=wSsXX60YAbC123xyz789...
```

## Step 4: Restart your Next.js server

After adding/changing environment variables, you **must** restart your dev server:

1. Stop the current server (Ctrl+C)
2. Run `npm run dev` again

## Step 5: Test

1. Go to your homepage
2. Scroll to footer
3. Enter your email: `rajatvermauf@gmail.com`
4. Click subscribe
5. Check your email inbox (and spam folder)

## Verification

To verify the variables are loaded:

1. Check your terminal/server logs - there should be NO error: "ZeptoMail API key not configured"
2. Try subscribing again
3. Check Supabase `newsletter_sends` table for send status

## Troubleshooting

**If emails still don't send:**
- Make sure there are no spaces around the `=` sign
- Make sure the API key is on a single line (no line breaks)
- Restart the server after making changes
- Check server logs for error messages
