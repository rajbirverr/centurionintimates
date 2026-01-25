# Performance & SEO Optimization Plan

## Issues Identified

### 1. Wishlist Persistence
**Problem**: Wishlist is stored only in localStorage, so:
- Items persist on the same device/browser when user logs in
- Items are LOST when user switches devices/browsers
- No cross-device synchronization

**Solution**: 
- ✅ Created `supabase-wishlist-schema.sql` - Database table for wishlist
- ✅ Created `src/lib/actions/wishlist.ts` - Server actions for wishlist
- ⏳ Need to update components to sync localStorage → database on login
- ⏳ Need to load wishlist from database when user is logged in

### 2. Performance Issues

#### Images Not Optimized
**Problem**: 
- Using regular `<img>` tags instead of Next.js `Image` component
- No lazy loading
- No image optimization (resizing, format conversion)
- Large images loading all at once

**Solution**:
- Convert all `<img>` to Next.js `Image` component
- Add `loading="lazy"` and proper `width`/`height`
- Use `priority` only for above-the-fold images
- Next.js will automatically optimize images

#### Slow Page Loads
**Problem**:
- Multiple sequential database queries
- No caching/revalidation strategy
- All images load immediately
- No code splitting

**Solution**:
- ✅ Pages already use SSR (good)
- Add `revalidate` for ISR (Incremental Static Regeneration)
- Optimize database queries (already parallel in some places)
- Use Next.js Image component for automatic optimization
- Add loading states

### 3. SEO Issues

#### Missing Metadata
**Problem**:
- Only homepage and root layout have metadata
- Product pages, category pages, sale page, etc. have no metadata
- No Open Graph tags for social sharing
- No structured data (JSON-LD)

**Solution**:
- Add `metadata` export to all pages
- Add dynamic metadata for product/category pages
- Add Open Graph and Twitter Card tags
- Add structured data for products

#### Images Missing Alt Text
**Problem**:
- Many images don't have proper `alt` attributes
- Missing alt text hurts SEO and accessibility

**Solution**:
- Add descriptive alt text to all images
- Use product names, category names, etc.

## Implementation Priority

### Phase 1: Critical (Do First)
1. ✅ Wishlist database schema and server actions
2. ⏳ Wishlist sync on login
3. ⏳ Convert homepage images to Next.js Image
4. ⏳ Add metadata to key pages (product, category, sale)

### Phase 2: Important
5. Convert all product images to Next.js Image
6. Add metadata to all remaining pages
7. Add proper alt text everywhere
8. Add ISR caching strategy

### Phase 3: Nice to Have
9. Add structured data (JSON-LD)
10. Add Open Graph images
11. Optimize database queries further

## Files to Update

### Wishlist
- `src/components/account/WishlistSection.tsx` - Sync with DB
- `src/components/allproducts/ProductGrid.tsx` - Sync on login
- `src/components/allproducts/ProductCard.tsx` - Use DB wishlist

### Images
- `src/app/page.tsx` - Homepage images
- `src/components/allproducts/ProductCard.tsx` - Product images
- `src/components/homepage/ShineCarousel.tsx` - Carousel images
- `src/components/homepage/HomepageSetsSection.tsx` - Set images
- `src/app/product/[id]/page.tsx` - Product detail images

### Metadata
- `src/app/all-products/page.tsx`
- `src/app/sale/page.tsx`
- `src/app/product/[id]/page.tsx`
- `src/app/blogs/page.tsx`
- `src/app/blogs/[slug]/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/account/page.tsx`

## Next Steps

1. Run `supabase-wishlist-schema.sql` in Supabase SQL Editor
2. Update wishlist components to use database
3. Convert images to Next.js Image component
4. Add metadata to all pages
