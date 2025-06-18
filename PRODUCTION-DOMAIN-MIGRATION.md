# Production Domain Migration Checklist

When you migrate from `spooky-books-next.vercel.app` to your production domain (e.g., `spookybooks.com`), you MUST update these configurations:

## 🔧 Stripe Configuration Updates

### 1. Webhook Endpoints
**Current**: `https://spooky-books-next.vercel.app/api/stripe-webhook`
**Update to**: `https://your-production-domain.com/api/stripe-webhook`

**Steps**:
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Find your webhook endpoint
3. Edit the endpoint URL to use your production domain
4. **Keep the same webhook secret** (no need to regenerate)

### 2. Environment Variables (if domain-specific)
- Update `NEXT_PUBLIC_SITE_URL` in Vercel to production domain
- Verify all Stripe keys are using live keys (not test keys) for production

## 🎨 Sanity Studio Configuration Updates

### 1. Visual Editing URLs
**Files to update**:
- `studio/sanity.config.ts` - Update preview URLs
- Environment variables for presentation tool

**Current URLs**:
```typescript
// In studio/sanity.config.ts
previewUrl: 'https://spooky-books-next.vercel.app'
```

**Update to**:
```typescript
previewUrl: 'https://your-production-domain.com'
```

### 2. CORS Configuration
**Update these environment variables**:
- `SANITY_STUDIO_PREVIEW_ORIGIN` → Your production domain
- `NEXT_PUBLIC_SANITY_STUDIO_URL` → May need updating if studio moves

### 3. Webhook Revalidation
**Current**: Webhooks trigger revalidation for `spooky-books-next.vercel.app`
**Update**: Verify webhook revalidation works with new domain

## 🌐 DNS & Domain Setup

### 1. Vercel Domain Configuration
1. Add custom domain in Vercel project settings
2. Configure DNS records (A/CNAME) with your domain provider
3. Enable SSL certificate

### 2. Environment Variables Update
```bash
# Update in Vercel Dashboard
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
SANITY_STUDIO_PREVIEW_ORIGIN=https://your-production-domain.com
```

## ✅ Testing Checklist After Migration

- [ ] Stripe webhooks fire correctly on new domain
- [ ] Visual editing works in Sanity Studio  
- [ ] Product pages load correctly
- [ ] Checkout flow works end-to-end
- [ ] Stock deduction happens automatically
- [ ] All internal links use new domain
- [ ] SSL certificate is active and valid

## 📋 Migration Order

1. **Setup DNS & Domain** (Vercel custom domain)
2. **Update Environment Variables** (NEXT_PUBLIC_SITE_URL, etc.)
3. **Update Stripe Webhook URL** (critical for stock sync)
4. **Update Sanity Studio Config** (visual editing)
5. **Test Full Checkout Flow** (verify webhook works)
6. **Monitor for 24 hours** (ensure no broken integrations)

---

**⚠️ CRITICAL**: Don't forget to update the Stripe webhook URL - this is essential for inventory sync to continue working on your production domain!