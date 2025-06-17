# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture Overview

This is a **Next.js 15 e-commerce site** for Spooky Books, migrated from Gatsby + Shopify. Built with the App Router and TypeScript. Key integrations include:

- **Sanity CMS** - Content management via `@sanity/client` and `next-sanity` with automated webhook sync
- **Stripe** - Payment processing via `@stripe/stripe-js` and `stripe` with automated product creation
- **Tailwind CSS 4** - Styling with custom CSS modules for components
- **Custom fonts** - Neue Haas Unica Pro served from `/src/webfonts/`
- **Sonner** - Modern toast notification system with rich colors and animations

### Migration Status
- ✅ **Framework**: Migrated from Gatsby to Next.js App Router
- ✅ **Components**: All key UI components converted (Header, Footer, Layout, Navigation, ProductCard, etc.)
- ✅ **Cart System**: React Context-based cart with real-time state management
- ✅ **Cart Design**: Clean, minimal checkout design with gray background and refined typography
- ✅ **Toast System**: Upgraded to Sonner with clickable "View Cart" navigation
- ✅ **Currency Localization**: Automatic locale detection with USD/AUD/EUR support
- ✅ **Product Data**: Mock data structure aligned with future Sanity schema
- ✅ **Routing**: Dynamic product pages with static generation
- ✅ **Styling**: Light mode styling with proper contrast
- ✅ **Backends**: Stripe + Sanity integrations complete with webhook automation
- ✅ **Product Variants**: Flexible apparel system supporting both sized (t-shirts) and non-sized (tote bags) products
- ✅ **Category System**: Unified Publications vs Apparel categories
- ✅ **Homepage CMS**: Sanity-powered homepage with visual editing capabilities  
- ✅ **Visual Editing**: Complete draft mode and presentation tool setup with Live Content API
- ✅ **Production Ready**: Deployed to Vercel with visual editing fully functional
- ✅ **Advanced Inventory Management**: Sophisticated stock reservation system with race condition prevention
- ✅ **Real-time Stock Validation**: Atomic transactions and reserved quantity tracking

## Data Management

### Sanity CMS Integration
- **Studio**: `/studio/` - Sanity Studio configuration with custom schemas and visual editing
- **Product Schema**: Enhanced with variants for apparel sizing and Stripe integration fields
- **Category Schema**: Simplified to Publications vs Apparel binary system
- **Homepage Schema**: Flexible hero sections with layout variables (pair/single) and caption support
- **Webhook System**: Auto-creates Stripe products when Sanity content is published
- **API Routes**: Complete CRUD operations and sync utilities
- **Visual Editing**: Draft mode API endpoints, presentation tool with live preview, and Live Content API
- **Real-time Updates**: Instant content synchronization between draft and published states
- **CORS Configuration**: Middleware for cross-origin requests from Sanity Studio

### Product Data Structure
- **Source**: Sanity CMS via GROQ queries (replaces mock data)
- **Core Fields**: id, title, author, slug, price, category, images[], description, stockQuantity
- **Inventory Fields**: stockQuantity, reservedQuantity (for tracking available vs reserved stock)
- **Stripe Fields**: stripePriceId, stripeProductId (auto-populated)
- **Variants**: Optional array for sized apparel with size-specific stock tracking and individual reservedQuantity
- **Categories**: Publications (books, magazines) or Apparel (sized: t-shirts, hoodies | non-sized: tote bags, stickers)

### Advanced Inventory Management System
- **Stock Reservations**: 30-minute session-based inventory locking during checkout process
- **Atomic Transactions**: Race condition prevention using Sanity transactions for concurrent operations
- **Reserved Quantity Tracking**: Separate fields for total stock vs available stock calculations
- **Automatic Cleanup**: Expired reservation release with background cleanup routines
- **Variant-Level Reservations**: Individual stock tracking for each apparel size
- **Real-time Validation**: Live stock checking with cart quantity consideration
- **Overselling Prevention**: Comprehensive validation before checkout session creation

### Cart Context
- **Location**: `src/components/cart-contex.tsx`
- **Provider**: Wraps entire app in `layout.tsx`
- **State**: CartItem[] with quantity, size variant, and total calculation
- **Operations**: addItem (with size-aware merging), removeItem (with size), clearCart
- **Hook**: `useCart()` with error handling for context usage
- **Size Support**: Tracks size variants for apparel products as separate cart items

### Currency Localization
- **Hook**: `src/lib/hooks/use-locale-currency.ts` - Detects browser language and maps to appropriate currency
- **Utility**: `src/lib/utils/format-price.ts` - Formats prices using Intl.NumberFormat
- **Mapping**: en-US → USD, en-AU → AUD, de/fr → EUR, fallback → USD
- **Integration**: Used in cart page and product cards for locale-aware pricing

## Component Architecture

### Layout System
- **Root Layout**: `src/app/layout.tsx` with CartProvider and Toaster
- **Page Layout**: `src/components/layout.tsx` with Header, Footer, and responsive main content (`mx-4 2xl:mx-16`)
- **Header Grid**: 12-column responsive layout with aligned title, navigation, and cart
- **Accessibility**: Proper ARIA labels and semantic HTML structure

### E-commerce Components
- **ProductCard**: Grid-compatible with Next.js Image optimization, author display, and intelligent stock status messaging showing lowest size stock for apparel
- **ProductListing**: Category filtering with Sanity CMS integration and live stock updates
- **AddToCart**: Enhanced button with smart disabled states, real-time stock validation, and apparel size awareness
- **SizeSelector**: Clean apparel size selection with minimal UI, strikethrough for sold-out sizes, and responsive grid
- **CartButton**: Simplified inline text component showing "Cart" or "Cart (X)" format
- **CartPage**: Optimized checkout with 1-2 second flow, Stripe.js preloading, author display in cart items, and mobile-first responsive design
- **CartItem**: Cart-specific stock calculation with sophisticated quantity validation, author display, and responsive layout with proper mobile image sizing
- **SkeletonLoaders**: Responsive loading states matching mobile-first cart layout with full-width image skeletons

### Stock Management Components
- **Stock Validation**: Real-time available stock calculation (stockQuantity - reservedQuantity)
- **Inventory Monitoring**: Overselling detection and race condition prevention
- **Error Handling**: Comprehensive logging and retry mechanisms with exponential backoff
- **Cache Management**: In-memory stock caching with TTL and automatic cleanup

### Toast System
- **Library**: Sonner (v2.0.5) for rich toast notifications
- **Setup**: `<Toaster position="bottom-right" />` in root layout
- **Navigation**: Cart add toast includes "View Cart" action button for direct navigation
- **Usage**: `toast.success()` with clickable actions and ghost emoji branding
- **Styling**: Optimized for light mode interface with pointer cursor feedback

## Routing Structure

### App Router Implementation
- **Home**: `/` - Hero product showcases with image pairs
- **Products**: `/products/` - Product grid with category navigation and stock status
- **Product Detail**: `/products/[slug]/` - Dynamic pages with size selection and stock validation
- **Cart**: `/cart/` - Optimized checkout page with 1-2 second checkout flow, Stripe.js preloading, and real-time stock validation
- **Cart Demo**: `/cart/demo/` - Populates cart with sample items for testing
- **Static Generation**: `generateStaticParams` for build optimization

### API Routes

#### Core E-commerce APIs
- **Sanity Webhook**: `/api/sanity-stripe` - Auto-creates Stripe products when Sanity content is published
- **Optimized Checkout**: `/api/checkout` - **NEW** Single endpoint with rate limiting (5/min), combining stock validation + session creation for 1-2 second checkout
- **Checkout Session**: `/api/create-checkout-session` - Legacy endpoint (replaced by `/api/checkout`)
- **Stripe Webhook**: `/api/stripe-webhook` - Payment event processing with automatic stock deduction
- **Product Sync**: `/api/sync-existing-products` - Bulk migration utility for existing products
- **Setup Categories**: `/api/setup-categories` - Automated category creation

#### Advanced Inventory Management APIs
- **Stock Reservation**: `/api/reserve-stock` - Atomic stock locking during checkout with session expiration
- **Stock Release**: `/api/release-stock` - Release reserved inventory on payment failure or timeout
- **Stock Status**: `/api/stock-status` - Real-time stock checking with GET/POST endpoints
- **Inventory Health**: `/api/inventory-health` - System health monitoring with cleanup triggers
- **Inventory Monitor**: `/api/inventory-monitor` - Advanced monitoring with overselling detection
- **Products Optimized**: `/api/products-optimized` - Cached, essential-fields-only product endpoint

#### System Administration APIs
- **Init Reserved Quantity**: `/api/init-reserved-quantity` - Initialize reservedQuantity fields for existing products
- **Cleanup Products**: `/api/cleanup-products` - Remove legacy fields from product documents
- **Cleanup Reserved Fields**: `/api/cleanup-reserved-fields` - Remove orphaned reservedQuantity fields from existing products
- **Fix Variant Keys**: `/api/fix-variant-keys` - Add missing _key properties to variant arrays for Sanity compliance
- **Revalidate**: `/api/revalidate` - Webhook-triggered page revalidation optimized for Vercel free tier
- **Sync Status**: `/api/check-product-sync` - Monitor sync status between Sanity and Stripe
- **Draft Mode**: `/api/draft-mode/enable` & `/api/draft-mode/disable` - Visual editing draft mode control
- **Debug**: `/debug` - Sanity data debugging endpoint for development

#### Rate Limiting & Monitoring APIs
- **Rate Limit Stats**: `/api/rate-limit-stats` - Monitor rate limiter statistics and system health (admin-only)
- **Test Rate Limit**: `/api/test-rate-limit` - Development endpoint for testing rate limiting behavior (dev-only)

### Route Patterns
```tsx
// Product detail page with size selection
/products/[slug]/page.tsx
/products/[slug]/product-page-client.tsx

// Static params generation (now uses Sanity data)
export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

// Webhook endpoint for Sanity-Stripe sync
/api/sanity-stripe/route.ts
```

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
  - `src/app/api/` - API routes for Sanity-Stripe integration and optimized checkout flow
- `src/components/` - Reusable React components with CSS modules
- `src/data/` - Type definitions and interfaces (mock data replaced by Sanity)
- `src/lib/` - Utilities, hooks, and shared logic
  - `src/lib/hooks/` - Custom React hooks (useLocaleCurrency)
  - `src/lib/utils/` - Utility functions (formatPrice)
  - `src/lib/sanity/` - Sanity client, queries, type definitions, and Live Content API
- `src/styles/` - Global CSS styles  
- `studio/` - Sanity Studio configuration and schemas
  - `studio/schemas/` - Product, category, and homepage schema definitions
- `public/images/` - Product images and static assets
- `src/webfonts/` - Custom Neue Haas Unica Pro font files

## Styling System

### Tailwind CSS 4 + CSS Modules
- **Global**: Tailwind utilities for rapid development
- **Components**: CSS Modules (`.module.css`) for scoped styles
- **Typography**: Custom "Neue Haas Unica" font with 400, 500, 600 weights
- **Grid**: 12-column CSS Grid layout system
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints

### Color System
```css
/* Light mode only */
body: bg-white text-black

/* Cart page */
cart: bg-gray-50 text-black

/* Footer */
footer: bg-gray-100 text-black
```

### Font Implementation
```css
@font-face {
  font-family: 'Neue Haas Unica';
  font-weight: 400 | 500 | 600;
  src: url(../webfonts/neue-haas-unica-pro-web.woff2) format("woff2");
}

html, body {
  font-family: 'Neue Haas Unica', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## Development Patterns

### Recent UX Improvements (2024)
**Clean Product Page Interface:**
- **Smart AddToCart States**: Shows disabled "Add to Cart" (not "SOLD OUT") when no size selected for apparel
- **Minimal Size Selection**: Removed redundant "Size" headers and status text from SizeSelector component  
- **No Redundant Messaging**: Eliminated duplicate category labels and redundant "sold out" text (button states communicate this)
- **Streamlined Flow**: Removed confusing helper text like "Please select a size to add to cart"

**Enhanced Stock Messaging System:**
- **Intelligent Apparel Logic**: Shows lowest individual size stock instead of misleading totals across all sizes
- **Urgency Hierarchy**: "LAST ONE" (red) for single items, "ONLY X LEFT" (orange) for 2-3 items
- **Universal Threshold**: ≤3 stock threshold creates clear urgency without overwhelming users
- **Consistent Formatting**: Uppercase messaging across all contexts for professional appearance
- **Automatic Cart Adjustment**: Quantities automatically reduced when stock limits are exceeded

**Unified Cart Stock Management (Latest):**
- **Cart-Specific Logic**: Sophisticated stock calculation that accounts for current item quantity in cart stepper
- **Real Stock Limits**: Removed arbitrary maximum quantities, now uses actual Sanity inventory data with proper validation
- **Reliable Quantity Controls**: Simplified validation logic prevents overselling while allowing proper quantity adjustments
- **Mobile-First Cart Layout**: Responsive design with full-width images on mobile, proper spacing on desktop
- **No Discount Functionality**: Completely removed discount code features from cart interface
- **Toast Notifications**: Clear feedback when quantities are automatically adjusted due to stock limits

**Advanced Inventory Management:**
- **Consistent Enforcement**: Stock limits enforced across product pages, cart controls, and checkout
- **Real-time Validation**: Toast notifications inform users of automatic adjustments
- **Smart Quantity Controls**: Cart + and - buttons respect actual available stock limits

**Design Philosophy**: The interface relies on clear visual states and intelligent messaging hierarchy rather than redundant text labels, creating urgency where appropriate while maintaining a clean, professional user experience. Stock calculation consistency ensures users never encounter conflicting availability information between product pages and cart.

### Non-Sized Apparel Implementation (2024)
**Flexible Product Architecture:**
- **Three Product Types**: Publications (books), Sized Apparel (t-shirts), Non-sized Apparel (tote bags)
- **Conditional Logic**: Components distinguish between `isApparel` (category) and `hasSizes` (has variants)
- **Smart Stock Management**: Non-sized apparel uses main `stockQuantity` like publications
- **Unified UX**: Same stock messaging and cart behavior across all non-sized products

**Key Technical Patterns:**
```tsx
// Separate apparel category from size requirement
const isApparel = product.category.toLowerCase() === 'apparel'
const hasSizes = isApparel && product.variants && product.variants.length > 0

// Size selector only for products that actually have sizes
{hasSizes && <SizeSelector variants={product.variants} />}

// Stock display for publications AND non-sized apparel
{!hasSizes && <StockDisplay />}

// AddToCart logic - only require size selection if product has sizes
const needsSizeSelection = hasSizes && !selectedSize
```

**Sanity Schema Logic:**
```typescript
// Show stockQuantity field for publications and non-sized apparel
hidden: ({ document }) => {
  const isApparel = document?.category?._ref === 'f16b392c-4089-4e48-8d5e-7401efb17902'
  const hasVariants = document?.variants && document.variants.length > 0
  return isApparel && hasVariants // Only hide if apparel AND has variants
}
```

### Import Conventions
**Use kebab-case file names with named exports:**
```tsx
// Correct
import { CartButton } from './cart-button'
import { ProductCard } from './product-card'
import { products, type Product } from '@/data/products'
import styles from './component.module.css'

// Incorrect (legacy Gatsby pattern)
import CartButton from './CartButton'
```

### Stock Status Implementation
**Consistent Messaging Patterns:**
```tsx
// Product titles with stock status (Updated 2024)
"Product Title (SOLD OUT)"     // 0 stock
"Product Title (LAST ONE)"     // 1 stock  
"Product Title (ONLY 2 LEFT)"  // 2-3 stock

// Component-level stock validation
import { getStockStatusText, getAvailableStock } from '@/lib/utils/stock-validation'

const stockStatus = getStockStatusText(sanityProduct, size)
const availableStock = getAvailableStock(sanityProduct, size)

// Apparel: Use lowest individual size stock
const lowestStock = Math.min(...availableVariants.map(v => getStockForDisplay(v.size)))
```

**Cart Quantity Logic (Latest Implementation):**
```tsx
// Cart-specific stock calculation accounting for current item quantity
const getCurrentAvailableStock = () => {
  if (!sanityProduct) return null
  
  const totalAvailableStock = getAvailableStock(sanityProduct, item.size)
  // For cart stepper: show how much more can be added beyond current quantity
  const otherItemsInCart = getCartItemQuantity(item.id, item.size) - localQuantity
  return Math.max(0, totalAvailableStock - otherItemsInCart)
}

// Simplified quantity validation - prevent increases beyond available stock
if (newQuantity > localQuantity) {
  if (currentAvailableStock !== null && newQuantity > currentAvailableStock) {
    return // Block increase beyond stock limit
  }
}

// Automatic adjustment with clear notifications
if (adjustedQuantity === 0) {
  removeItem(item.id, item.size)
  toast.warning(`${item.title}${sizeText} was removed – no longer in stock`)
} else {
  setLocalQuantity(adjustedQuantity)
  updateItemQuantity(item.id, adjustedQuantity, item.size)
  toast.info(`${item.title}${sizeText} quantity reduced to ${adjustedQuantity} (stock limit)`)
}

// Button disabled when at stock limit
disabled={currentAvailableStock !== null && localQuantity >= currentAvailableStock}
```

### Interaction Patterns

#### Toast Usage
```tsx
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Success notification with haptic feedback and navigation
const router = useRouter()

if ('vibrate' in navigator) {
  navigator.vibrate(50)
}
toast.success(`👻 Added ${product.title} to cart`, {
  description: "Click to view cart",
  action: {
    label: "View Cart",
    onClick: () => router.push("/cart"),
  },
})
```

#### Cart Integration with Size Variants
```tsx
import { useCart } from '@/components/cart-contex'

function Component() {
  const { cart, addItem, removeItem, total } = useCart()
  
  const handleAddToCart = () => {
    addItem({ 
      id: variantId || productId, 
      title, 
      price, 
      quantity, 
      image,
      size: selectedSize // For apparel products
    })
  }
  
  const handleRemove = () => {
    removeItem(itemId, size) // Size-aware removal
  }
}
```

#### Currency Localization
```tsx
import { useLocaleCurrency } from '@/lib/hooks/use-locale-currency'
import { formatPrice } from '@/lib/utils/format-price'

function Component() {
  const { locale, currency: detectedCurrency } = useLocaleCurrency()
  
  // Format prices with locale-appropriate currency
  const formattedPrice = formatPrice(price, detectedCurrency, locale)
  
  return <span>{formattedPrice}</span> // $29.99, A$29.99, €29,99
}
```

#### Optimized Checkout Flow (2024)
**High-Performance Checkout Implementation:**
- **Single API Call**: New `/api/checkout` endpoint combines stock validation + session creation (replaces 2 separate calls)
- **Stripe.js Preloading**: Cart page preloads Stripe.js on mount for instant checkout initiation
- **Inline Loading States**: Replaced disruptive modal with inline button states (`PROCESSING...`)
- **Data Reuse**: Passes cart page product data to API to eliminate redundant Sanity queries
- **Atomic Operations**: Server-side atomic stock locking prevents race conditions during checkout
- **Enhanced Error Handling**: Specific error types (`STOCK_ERROR`, `RESERVATION_ERROR`, `SYSTEM_ERROR`) with user-friendly messages

**Performance Results:**
- **Before**: 6-9 seconds (modal + 2 API calls + redundant queries)
- **After**: 1-2 seconds (inline + single API call + preloaded Stripe.js)

```tsx
// Optimized checkout implementation
const handleCheckout = async () => {
  setCheckoutLoading(true)
  setCheckoutError(null)

  // Single optimized API call with data reuse
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart,
      productData: sanityProducts, // Reuse fetched data
      locale,
      currency
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    // Handle specific error types with inline display
    if (result.type === 'STOCK_ERROR') {
      setCheckoutError(`Some items are no longer available:\n${result.details.join('\n')}`)
    }
    return
  }

  // Use preloaded Stripe.js or fallback
  const stripe = stripePromise ? await stripePromise : await loadStripe(STRIPE_KEY)
  await stripe.redirectToCheckout({ sessionId: result.sessionId })
}

// Stripe.js preloading on cart mount
useEffect(() => {
  const loadStripe = async () => {
    const { loadStripe } = await import('@stripe/stripe-js')
    setStripePromise(loadStripe(STRIPE_KEY))
  }
  if (cart.length > 0) loadStripe()
}, [cart.length])
```

#### Rate Limiting Implementation (2024)
**Production-Ready Rate Limiting for Checkout Protection:**
- **Intelligent Limits**: 5 checkout attempts per minute per IP address
- **Success Exemption**: Successful checkouts don't count against the limit (prevents legitimate user penalties)
- **Automatic Cleanup**: Memory-efficient with automatic cleanup of expired rate limit entries
- **Client Identification**: Multi-header IP detection (Vercel, Cloudflare, proxy-aware)
- **Graceful Errors**: User-friendly rate limit messages with retry timing
- **Monitoring**: Admin endpoint for rate limit statistics and system health

**Rate Limiting Configuration:**
```tsx
// Rate limiter setup
const checkoutRateLimiter = new RateLimiter({
  maxRequests: 5,                    // 5 attempts per window
  windowMs: 60 * 1000,              // 1 minute window
  skipSuccessfulRequests: true       // Don't penalize successful checkouts
})

// IP detection with fallbacks
function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for') // Vercel
  
  return forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || vercelForwarded || 'unknown'
}

// Checkout endpoint integration
const clientId = getClientIdentifier(request)
const rateLimitResult = checkoutRateLimiter.check(clientId)

if (!rateLimitResult.allowed) {
  return createRateLimitResponse(rateLimitResult) // 429 with Retry-After header
}

// On successful checkout, reduce rate limit count
checkoutRateLimiter.recordSuccess(clientId)
```

**Client-Side Error Handling:**
```tsx
// Rate limit error handling in cart
if (result.type === 'RATE_LIMIT_ERROR') {
  setCheckoutError(result.message || 'Too many checkout attempts. Please wait a moment and try again.')
}
```

#### Visual Editing Usage
```tsx
// Homepage with real-time Sanity data
import { sanityFetch } from '@/lib/sanity/live'
import { SanityLive } from '@/lib/sanity/live'

// Live query with tags for selective revalidation  
const { data } = await sanityFetch({
  query: homepageQuery,
  tags: ['homepage']
})

// Layout with visual editing components
function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {isEnabled && <VisualEditing />}
        <SanityLive />
      </body>
    </html>
  )
}

// Draft mode activation
const response = await fetch('/api/draft-mode/enable')
```

#### Size Selector Usage
```tsx
import { SizeSelector } from '@/components/size-selector'

function ProductPage({ product }) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  
  const handleSizeChange = (size: string, variant: ProductVariant) => {
    setSelectedSize(size)
    setSelectedVariant(variant)
  }
  
  const isApparel = product.category.toLowerCase() === 'apparel'
  
  return (
    <>
      {isApparel && (
        <SizeSelector
          variants={product.variants}
          selectedSize={selectedSize}
          onSizeChange={handleSizeChange}
        />
      )}
      <AddToCart
        product={product}
        available={hasStock}
        selectedSize={selectedSize}
        isApparel={isApparel}
      />
      {selectedSize && (
        <p className="text-sm text-gray-600 mt-2">
          Size {selectedSize.toUpperCase()}
        </p>
      )}
    </>
  )
}
```

#### Responsive Cart Layout
```tsx
// Mobile-first cart item layout
<div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 w-full">
  {/* Full-width images on mobile */}
  <div className="w-full sm:w-24 sm:h-32">
    <Image
      className="w-full h-auto sm:h-32 sm:w-24 object-cover rounded"
      // ... other props
    />
  </div>
  
  {/* Responsive quantity controls */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 uppercase">Qty:</span>
      {/* Quantity stepper */}
    </div>
    <button className="px-4 py-1 border rounded">Remove</button>
  </div>
  
  {/* Responsive subtotal positioning */}
  <div className="text-sm text-right sm:text-left sm:ml-auto mt-2 sm:mt-0">
    <CurrencyPrice price={total} />
  </div>
</div>
```

#### Custom Button Animations with Disabled States
```css
.addToCart {
  transition-duration: 581.71ms;
  transition-timing-function: linear(/* custom 100-point easing curve */);
  cursor: pointer;
}

.addToCart:hover {
  background-color: rgb(32, 32, 32);
}

.addToCart:active {
  transform: scale(0.95);
}

/* Disabled state for sold out items */
.addToCart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgb(209, 213, 219);
  color: rgb(107, 114, 128);
}
```

## Backend Integration

### Environment Variables
Required environment variables for full functionality:
```bash
# Stripe Integration
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Sanity CMS
SANITY_API_TOKEN=sk...
SANITY_VIEWER_TOKEN=sk...  # For draft mode and Live Content API
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-domain.com/studio

# Visual Editing (Production)
SANITY_STUDIO_PREVIEW_ORIGIN=https://your-domain.com
```

### Webhook Configuration
1. **Sanity Webhook**: Configure webhook in Sanity Studio to trigger `/api/sanity-stripe` on document publish
2. **Event Types**: Listen for `create`, `update`, `delete` events on product and homepage documents
3. **Automatic Sync**: Creates Stripe products/prices with author attribution and saves IDs back to Sanity
4. **Page Revalidation**: Automatic revalidation of affected pages via `/api/revalidate` webhook
5. **Vercel Optimization**: Selective revalidation reduces build usage on free tier

### Visual Editing Setup
1. **Draft Mode**: Enabled via `/api/draft-mode/enable` endpoint with SANITY_VIEWER_TOKEN
2. **Presentation Tool**: Configured in Sanity Studio with live preview URL
3. **Live Content API**: Real-time updates using `defineLive` with `sanityFetch` and `SanityLive`
4. **Document Locations**: Homepage and product location mapping for editor navigation
5. **Studio Structure**: Custom structure with homepage singleton prominently displayed
6. **CORS Configuration**: Middleware handles cross-origin requests from Sanity Studio
7. **Click-to-Edit**: Visual overlays with stega encoding for instant content editing

### Stock Management
- **Publications**: Single `stockQuantity` field for entire product
- **Apparel**: Individual `stockQuantity` per size variant in `variants` array
- **Cart-Specific Logic**: Sophisticated quantity validation that accounts for current item quantity in cart calculations
- **Real Stock Limits**: No arbitrary maximums - cart steppers respect actual Sanity inventory data with proper overflow prevention
- **Validation**: Real-time stock checking during checkout session creation with automatic quantity adjustment
- **Consistent Enforcement**: Stock limits enforced across product pages, cart quantity controls, and checkout process
- **UI Indicators**: Smart button states and strikethrough for sold out items (no redundant text labels)

#### Stock Status Messaging (Updated 2024)
**Universal Threshold**: ≤3 stock triggers urgency messaging across all contexts

**Messaging Hierarchy:**
- **0 stock**: "SOLD OUT" (red)
- **1 stock**: "LAST ONE" (red)  
- **2-3 stock**: "ONLY X LEFT" (orange)
- **4+ stock**: "IN STOCK" or no label (green/neutral)

**Apparel Logic**: Shows lowest individual size stock (not sum across sizes) to prevent misleading high numbers

**Implementation Locations:**
- Product grid titles: "(LAST ONE)" or "(ONLY X LEFT)" in parentheses
- Product pages: Colored status text with proper urgency hierarchy  
- Cart items: Warning messages with automatic quantity adjustment
- Size selector: Visual states only (strikethrough for sold out)

### Data Integrity & Maintenance
- **Schema Validation**: Automatic cleanup of unknown fields from Sanity documents
- **Array Key Management**: UUID-based `_key` generation for Sanity array compliance  
- **Webhook Optimization**: Selective page revalidation for Vercel free tier efficiency
- **Error Recovery**: Comprehensive cleanup APIs for production data maintenance

#### Maintenance API Usage
```bash
# Fix Sanity Studio "Unknown field found" errors
POST /api/cleanup-reserved-fields

# Resolve "Missing keys" errors in variant arrays  
POST /api/fix-variant-keys

# Trigger selective page revalidation
POST /api/revalidate
```

**Common Issues Resolved:**
- Unknown `reservedQuantity` fields appearing in Sanity Studio
- Missing `_key` properties preventing variant array editing
- Sanity Studio validation errors for system-managed fields

## Deployment Guide

### Production Deployment (Vercel)
1. **GitHub Repository**: https://github.com/fraser-stanley/spooky-books-next
2. **Live Site**: https://spooky-books-next.vercel.app
3. **Sanity Studio**: https://spooky-books.sanity.studio

### Environment Variables Setup
**Required in Vercel Dashboard:**
```bash
# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Sanity CMS
SANITY_API_TOKEN=sk...  # Editor permissions
SANITY_VIEWER_TOKEN=sk... # Read + Visual Editing
NEXT_PUBLIC_SANITY_PROJECT_ID=0gbx06x6
NEXT_PUBLIC_SANITY_DATASET=production

# Site URLs
NEXT_PUBLIC_SITE_URL=https://spooky-books-next.vercel.app
NEXT_PUBLIC_SANITY_STUDIO_URL=https://spooky-books.sanity.studio
SANITY_STUDIO_PREVIEW_ORIGIN=https://spooky-books-next.vercel.app
```

### Visual Editing Access
1. **Studio Access**: Visit https://spooky-books.sanity.studio
2. **Presentation Mode**: Click "Presentation" tab in studio
3. **Homepage Editing**: Select "Homepage" → Live preview opens
4. **Content Management**: Add/edit hero sections with real-time updates

### Webhook Configuration
1. **Sanity Webhook URL**: `https://spooky-books-next.vercel.app/api/sanity-stripe`
2. **Trigger Events**: Document create, update, delete
3. **Filter**: `_type == "product"`
4. **Auto-sync**: Creates Stripe products and saves IDs back to Sanity

## Performance Optimizations

- **Image Loading**: Next.js Image with `priority` for above-the-fold content
- **Static Generation**: Pre-built product pages for optimal loading
- **Font Loading**: Multiple formats (woff2, woff) with system fallbacks
- **Code Splitting**: Automatic with Next.js App Router
- **CSS Optimization**: Tailwind CSS with PostCSS for minimal bundle size
- **Webhook Efficiency**: Optimized Stripe API calls with error handling and retry logic

## Accessibility Features

- **Keyboard Navigation**: Proper focus management and keyboard accessibility
- **ARIA Labels**: Proper labeling for interactive elements
- **Screen Readers**: Descriptive text for cart quantities and product info
- **Color Contrast**: Proper contrast ratios for light mode
- **Semantic HTML**: Proper heading hierarchy and landmark elements