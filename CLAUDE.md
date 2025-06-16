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
- ✅ **Product Variants**: Apparel sizing system with individual stock tracking
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
- **Core Fields**: id, title, slug, price, category, images[], description, stockQuantity
- **Inventory Fields**: stockQuantity, reservedQuantity (for tracking available vs reserved stock)
- **Stripe Fields**: stripePriceId, stripeProductId (auto-populated)
- **Variants**: Optional array for apparel with size-specific stock tracking and individual reservedQuantity
- **Categories**: Publications (books, magazines) or Apparel (t-shirts, totes)

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
- **ProductCard**: Grid-compatible with Next.js Image optimization, real-time stock status, and accurate "sold out" styling
- **ProductListing**: Category filtering with Sanity CMS integration and live stock updates
- **AddToCart**: Enhanced button with size support, real-time stock validation, and disabled states for sold out items
- **SizeSelector**: Apparel size selection with individual size stock counts and color-coded availability
- **CartButton**: Simplified inline text component showing "Cart" or "Cart (X)" format
- **CartPage**: Clean, minimal design with real-time stock validation and optimized checkout flow
- **CartItemEnhanced**: Advanced cart items with stock warnings, quantity controls, and availability checks
- **SkeletonLoaders**: Loading states for cart validation and checkout processing

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
- **Cart**: `/cart/` - Clean checkout page with size variant support and stock validation
- **Cart Demo**: `/cart/demo/` - Populates cart with sample items for testing
- **Static Generation**: `generateStaticParams` for build optimization

### API Routes

#### Core E-commerce APIs
- **Sanity Webhook**: `/api/sanity-stripe` - Auto-creates Stripe products when Sanity content is published
- **Checkout Session**: `/api/create-checkout-session` - Enhanced with comprehensive stock validation and reservation
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
- **Sync Status**: `/api/check-product-sync` - Monitor sync status between Sanity and Stripe
- **Draft Mode**: `/api/draft-mode/enable` & `/api/draft-mode/disable` - Visual editing draft mode control
- **Debug**: `/debug` - Sanity data debugging endpoint for development

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
  - `src/app/api/` - API routes for Sanity-Stripe integration and checkout
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

### Stock Status Styling
Consistent parentheses format for stock indicators:
```tsx
// Product titles with stock status
"Product Title (SOLD OUT)"
"Product Title (ONLY 3 LEFT)"

// Size selection with stock info  
"Size M (SOLD OUT)"
"Size L (ONLY 2 LEFT)"
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
        available={!needsSizeSelection && hasStock}
        selectedSize={selectedSize}
      />
    </>
  )
}
```

#### Custom Button Animations with Disabled States
```css
.addToCart {
  transition-duration: 581.71ms;
  transition-timing-function: linear(/* custom 100-point easing curve */);
  cursor: pointer;
}

.addToCart:hover {
  background-color: rgb(31, 41, 55);
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
2. **Event Types**: Listen for `create`, `update`, `delete` events on product documents
3. **Automatic Sync**: Creates Stripe products/prices and saves IDs back to Sanity

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
- **Validation**: Real-time stock checking during checkout session creation
- **UI Indicators**: Consistent parentheses format for low stock and sold out states

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