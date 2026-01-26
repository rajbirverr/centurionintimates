# Fix: Static Assets Sending Cookies

## Problem
When browsers request static images/assets, they're sending cookies with the request. This is unnecessary network traffic and prevents proper caching.

## Solution Implemented

### 1. Next.js Config Headers
Added cache headers in `next.config.ts` to ensure static assets:
- Have proper cache headers (`Cache-Control: public, max-age=31536000, immutable`)
- Are served without requiring cookies

### 2. For Supabase Images
**Important:** All Supabase images should be loaded through Next.js `Image` component, which:
- Proxies images through Next.js server
- Automatically optimizes images
- Prevents cookies from being sent to Supabase

**Example:**
```tsx
import Image from 'next/image'

// ✅ Good - Uses Next.js Image (no cookies sent)
<Image 
  src="https://zzmhjllcfwbjgzvfypbv.supabase.co/storage/v1/object/public/images/product.jpg"
  alt="Product"
  width={500}
  height={500}
/>

// ❌ Bad - Direct img tag (may send cookies)
<img src="https://zzmhjllcfwbjgzvfypbv.supabase.co/storage/v1/object/public/images/product.jpg" />
```

### 3. For Production (Recommended)
For best performance, consider:
1. **Use a CDN** (Cloudflare, AWS CloudFront) in front of your site
2. **Use a subdomain** for static assets (e.g., `static.centurionshoppe.com`)
3. **Configure Supabase Storage** to serve images via CDN

## What's Fixed

✅ Static files in `/public` folder - No cookies sent  
✅ Next.js static files (`/_next/static/`) - No cookies sent  
✅ Next.js optimized images (`/_next/image/`) - No cookies sent  
✅ Images loaded via Next.js Image component - Proxied, no cookies to Supabase  

## Testing

After deploying:
1. Open browser DevTools → Network tab
2. Load your website
3. Check static asset requests (images, CSS, JS)
4. Verify no cookies are sent in request headers
5. Verify `Cache-Control` headers are present

## Note

If you're still seeing cookies sent to Supabase image URLs:
- Make sure you're using Next.js `Image` component (not `<img>` tags)
- Check that images are being proxied through `/_next/image/` route
- Consider using a CDN for production
