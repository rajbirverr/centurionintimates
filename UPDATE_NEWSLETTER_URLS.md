# Fix Newsletter Email URLs - IMPORTANT

## The Problem
Your `.env.local` file currently has:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

This is why all email links show `localhost:3000` instead of your production URL.

## The Solution

**Update your `.env.local` file:**

1. Open `.env.local` in your project root
2. Change this line:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   
   To your production URL:
   ```env
   NEXT_PUBLIC_SITE_URL=https://centurionshoppe.com
   ```
   (Replace with your actual production domain if different)

3. **Restart your Next.js server** after making this change

## What I Fixed

1. ✅ **All URLs now use `NEXT_PUBLIC_SITE_URL`** - All email links (Complete Purchase, Unsubscribe, Visit Website, etc.) now read from your environment variable
2. ✅ **Product images in cart reminder emails** - Cart items now show actual product images instead of gray boxes
3. ✅ **Real cart data** - Cart reminder emails fetch and display real product names, prices, and images

## Product Images

The cart reminder email now:
- Fetches `product_image` from the database
- Displays actual product images in the email
- Shows product name and price for each item

## Testing

After updating `.env.local` and restarting:

1. Send a cart reminder email from `/admin/newsletter`
2. Check the email - all links should now point to your production URL
3. Product images should be visible (not gray boxes)

## Note

- For **development/testing**, you can keep `http://localhost:3000`
- For **production emails**, you **must** set it to your production domain
- The server must be restarted after changing `.env.local`
