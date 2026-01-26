# Fix Newsletter Email URLs and Data

## Issue 1: URLs Pointing to localhost:3000

**Problem:** Email links show `http://localhost:3000` instead of production URL

**Solution:** Set `NEXT_PUBLIC_SITE_URL` in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://centurionshoppe.com
```

Or for development:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note:** The code now defaults to `https://centurionshoppe.com` in production mode, but it's better to set it explicitly.

## Issue 2: Cart Reminder Email Has No Real Data

**Problem:** Cart reminder emails show placeholder data instead of actual cart items

**Solution:** The code now automatically fetches real cart data when sending cart-reminder emails. 

**How it works:**
1. When you send a cart-reminder email from admin panel
2. The system finds the user by email
3. Fetches their actual cart items from database
4. Includes real product names and prices in the email

**To test:**
1. Make sure a user has items in their cart (logged in user)
2. Go to `/admin/newsletter`
3. Click "Cart Reminder" template
4. Select "Single email" and enter the user's email
5. Send - the email will show their actual cart items

## What I Fixed

1. ✅ URLs now use `NEXT_PUBLIC_SITE_URL` or default to production URL
2. ✅ Cart reminder emails automatically fetch real cart data
3. ✅ All template URLs use the correct baseUrl variable

## Next Steps

1. **Set production URL in `.env.local`:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://centurionshoppe.com
   ```

2. **Restart your server** after updating `.env.local`

3. **Test cart reminder email:**
   - Make sure a user has items in cart
   - Send cart reminder to that user's email
   - Check if real cart items appear in email

## For Other Templates

- **Order Confirmation** - Will use real data when payment gateway is integrated
- **Invoice** - Will use real data when payment gateway is integrated  
- **Welcome** - Uses real user data (name from email)
- **Sale/Festival/Blog** - These are marketing emails, data is optional
