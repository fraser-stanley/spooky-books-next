# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run inventory:fix` - Fix Sanity Studio issues and initialize inventory system
- `npm run inventory:verify` - Verify autonomous inventory system health and configuration
- `npm run sanity:dev` - Start Sanity Studio development server
- `npm run sanity:build` - Build Sanity Studio for deployment
- `npm run sanity:deploy` - Deploy Sanity Studio to production

## Architecture Overview

This is a **Next.js 15.3.4 e-commerce site** for Spooky Books, migrated from Gatsby + Shopify. Built with the App Router and TypeScript with React 19.0.0. Key integrations include:

- **Sanity CMS** - Content management via `@sanity/client` and `next-sanity` with automated webhook sync
- **Stripe** - Payment processing via `@stripe/stripe-js` and `stripe` with automated product creation
- **Tailwind CSS 4** - Styling with custom CSS modules for components
- **Custom fonts** - Neue Haas Unica Pro served from `/public/webfonts/`
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
- ✅ **Visual Editing**: Complete draft mode and presentation tool setup with Live Content API (Fixed "Invalid secret" error 2024)
- ✅ **Production Ready**: Deployed to Vercel with visual editing fully functional
- ✅ **Advanced Inventory Management**: Sophisticated stock reservation system with race condition prevention
- ✅ **Real-time Stock Validation**: Atomic transactions and reserved quantity tracking
- ✅ **Autonomous Inventory System**: Enterprise-grade self-healing inventory with zero manual intervention
- ✅ **Automated Background Processes**: Stripe webhook-based cleanup (cron jobs removed for hobby plan compatibility)
- ✅ **Enhanced Error Handling**: User-friendly error messages with technical debt reduction
- ✅ **Multiple Success Pages**: Optimized checkout success flow with improved UX
- ✅ **Homepage Layout Options**: Three responsive layout options with Sanity CMS control and visual editing support
- ✅ **Unified Content System**: Modern contentBlocks system with backward compatibility and draggable reordering (2025)
- ✅ **Rich Text Content Migration**: Fully migrated from legacy plaintext descriptions to rich text system with metadata support (2025)
- ✅ **Schema Migration & Cleanup**: Legacy field removal, enhanced Studio UX, and modernized data structures (2025)
- ✅ **Enhanced API Ecosystem**: Comprehensive migration and debugging APIs for content management (2025)
- ✅ **Advanced SEO & Performance**: Comprehensive SEO system with structured data, automated alt text, and Next.js 15.3.4 optimizations (2025)

## SEO & Performance Optimization

### Advanced SEO Implementation
- **Comprehensive SEO System**: Complete implementation in `src/lib/seo/` with config, utilities, and TypeScript types
- **Dynamic Metadata Generation**: App Router metadata API with product-specific Open Graph and Twitter cards
- **Structured Data (JSON-LD)**: Schema.org implementation for products, organization, and breadcrumbs
- **Automated Alt Text**: Smart generation from Sanity data (product title + author + context) to reduce manual work
- **Internal Linking Strategy**: SEO-optimized anchor text generation with context-aware link text
- **Custom 404 Page**: User retention-focused with internal linking and SEO optimization
- **Heading Hierarchy**: Proper H1/H2/H3 structure without visual styling changes using screen-reader classes
- **Semantic HTML**: Enhanced accessibility with ARIA labels and semantic improvements
- **Dynamic Sitemap**: Auto-generated from Sanity content with proper priority and changefreq
- **Robots.txt**: Production-optimized with proper crawling directives

### Image Optimization & Layout Stability (Next.js 15.3.4)
- **Enhanced Configuration**: Updated `next.config.ts` with `remotePatterns` (replaces deprecated `domains`)
- **Advanced Image Formats**: WebP and AVIF automatic optimization with Sanity CDN integration
- **Responsive Image System**: Optimized device sizes `[640, 750, 828, 1080, 1200, 1920, 2048]`
- **Zero Layout Shift**: CSS `aspect-ratio` containers prevent Cumulative Layout Shift (CLS)
- **ImageWithSkeleton Component**: Production-ready component following Next.js 15 best practices
- **Progressive Loading System**: Multiple variants (full progressive, simple blur, skeleton states)
- **Pixelated Placeholders**: 20x20px instant-loading previews for slow connections
- **Sanity Image Optimization**: Dynamic URL generation with format, quality, and size transformations
- **Security Hardening**: SVG security policies and content security headers
- **Performance Metrics**: Quality optimized to 85 for optimal balance of size/quality

#### Advanced Loading Components
- **ProgressiveImage**: Full progressive loading with pixelated placeholders from Sanity URLs
- **ProgressiveImageSimple**: Simplified version using Next.js blur placeholders
- **ImageWithSkeleton**: Production component with aspect ratio containers and absolute positioned overlays
- **Skeleton Components**: Comprehensive loading states (ProductCard, Cart, Checkout) matching mobile-first design

### Performance Optimizations
- **Build Performance**: ~6s production builds with 63 static pages pre-generated
- **Bundle Optimization**: Dynamic imports for visual editing components and code splitting
- **Font Performance**: `font-display: swap` and preloading for Neue Haas Unica Pro
- **Lighthouse Scores**: 100/100 for SEO and Accessibility with advanced features
- **Zero Layout Shift**: CSS aspect-ratio containers eliminate Cumulative Layout Shift (CLS)
- **Progressive Loading**: Pixelated placeholders provide instant feedback on slow connections
- **Image Quality Balance**: 85 quality default optimized for Next.js 15 performance
- **Skeleton Matching**: Loading states match actual component layouts exactly to prevent visual jumps
- **Hardware Acceleration**: CSS-only animations with transform3d for smooth skeleton states

## Data Management

### Sanity CMS Integration
- **Studio**: `/studio/` - Sanity Studio configuration with custom schemas and visual editing
- **Product Schema**: Enhanced with rich text descriptions, metadata fields, variants for apparel sizing, and Stripe integration fields
- **Category Schema**: Simplified to Publications vs Apparel binary system with proper ID references
- **Homepage Schema**: Unified content block system with three responsive layout options (2-column, 3-column, full-width) and optional product/custom linking
- **Schema Migration**: Complete removal of legacy description fields and heroSections with safe migration paths
- **Field Validation**: Comprehensive validation rules and user-friendly error messages
- **Webhook System**: Auto-creates Stripe products when Sanity content is published
- **API Routes**: Complete CRUD operations and sync utilities
- **Visual Editing**: Secure draft mode API using `@sanity/preview-url-secret`, enhanced presentation tool with location resolvers, and Live Content API
- **Real-time Updates**: Instant content synchronization between draft and published states
- **CORS Configuration**: Middleware for cross-origin requests from Sanity Studio
- **Studio Performance**: Optimized caching and deployment strategies for immediate schema updates

### Product Data Structure
- **Source**: Sanity CMS via GROQ queries (replaces mock data)
- **Core Fields**: id, title, author, slug, price, category, images[], richDescription, metadata, stockQuantity
- **Content Fields**: 
  - **richDescription**: Rich text with formatting support (bold, italics, headings, links) using Portable Text
  - **metadata**: Technical details like ISBN, size, materials, binding, publication date (displayed in monospace)
- **Inventory Fields**: stockQuantity, reservedQuantity (for tracking available vs reserved stock)
- **Stripe Fields**: stripePriceId, stripeProductId (auto-populated)
- **Variants**: Optional array for sized apparel with size-specific stock tracking and individual reservedQuantity
- **Categories**: Publications (books, magazines) or Apparel (sized: t-shirts, hoodies | non-sized: tote bags, stickers)

### Rich Text Content System (2025)
- **Rich Descriptions**: Portable Text array with support for multiple block types and inline formatting
- **Supported Styles**: Normal text, H4/H5 headings, blockquotes with proper hierarchy
- **Inline Marks**: Strong (bold), emphasis (italic), and URL links with external/internal options
- **Link Support**: HTTP/HTTPS URLs, mailto links, tel links with optional new tab behavior
- **Editor Experience**: Clean WYSIWYG editing in Sanity Studio with real-time preview
- **Frontend Rendering**: Uses `@portabletext/react` for consistent HTML output and styling
- **Metadata Display**: Monospace technical details in gray background box below descriptions
- **Migration Strategy**: Clean removal of legacy plaintext descriptions with zero data loss

#### Rich Text Schema
```typescript
{
  name: 'richDescription',
  type: 'array',
  title: 'Rich Description',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Heading 5', value: 'h5' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              { name: 'href', type: 'url' },
              { name: 'blank', type: 'boolean', initialValue: true },
            ],
          },
        ],
      },
    },
  ],
}
```

#### Metadata Field Implementation
```typescript
{
  name: 'metadata',
  type: 'text',
  title: '📋 Product Metadata (Optional)',
  description: 'Technical details like ISBN, size, materials, binding, publication date, etc.',
  placeholder: `ISBN: 978-0-123456-78-9
Size: 6" × 9" (15cm × 23cm)
Pages: 320
Binding: Perfect bound
Published: October 2024
Materials: 100% organic cotton`,
  rows: 8,
  validation: (Rule) => Rule.max(1000),
}
```

#### Frontend Display Pattern
```tsx
// Rich text description rendering
{sanityProduct?.richDescription && (
  <ProductDescription value={sanityProduct.richDescription} />
)}

// Metadata display with monospace styling
{sanityProduct?.metadata?.trim() && (
  <div className="mt-4 mb-6">
    <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
      {sanityProduct.metadata}
    </pre>
  </div>
)}
```

### Advanced Inventory Management System
- **Stock Reservations**: 30-minute session-based inventory locking during checkout process
- **Atomic Transactions**: Race condition prevention using Sanity transactions for concurrent operations
- **Reserved Quantity Tracking**: Separate fields for total stock vs available stock calculations
- **Automatic Cleanup**: Expired reservation release with background cleanup routines
- **Variant-Level Reservations**: Individual stock tracking for each apparel size
- **Real-time Validation**: Live stock checking with cart quantity consideration
- **Overselling Prevention**: Comprehensive validation before checkout session creation

### Cart Context with Persistence (2024)
- **Location**: `src/components/cart-contex.tsx`
- **Provider**: Wraps entire app in `layout.tsx`
- **State**: CartItem[] with quantity, size variant, and total calculation
- **Operations**: addItem (with size-aware merging), removeItem (with size), clearCart
- **Hook**: `useCart()` with error handling for context usage
- **Size Support**: Tracks size variants for apparel products as separate cart items
- **Persistence**: localStorage with 30-day expiration, version control, and automatic hydration
- **Recovery**: Seamless cart restoration on page reload, tab reopen, and Stripe return (cancel)
- **Clearing**: Cart only cleared on successful payment completion (/cart/success)

### Currency Localization
- **Hook**: `src/lib/hooks/use-locale-currency.ts` - Detects browser language and maps to appropriate currency
- **Utility**: `src/lib/utils/format-price.ts` - Formats prices using Intl.NumberFormat
- **Mapping**: en-US → USD, en-AU → AUD, de/fr → EUR, fallback → USD
- **Integration**: Used in cart page and product cards for locale-aware pricing

## Component Architecture

### Layout System (Performance Optimized 2024)
- **Root Layout**: `src/app/layout.tsx` with CartProvider, Toaster, and optimized VisualEditingProvider
- **Page Layout**: `src/components/layout.tsx` with Header, Footer, and responsive main content (`mx-4 2xl:mx-16`)
- **Header Grid**: 12-column responsive layout with aligned title, navigation, and cart
- **Performance**: Font preloading, client component wrapping for bundle splitting
- **Accessibility**: Proper ARIA labels and semantic HTML structure

### Visual Editing Components (Next.js 15 Compatible)
- **VisualEditingProvider**: `src/components/visual-editing-provider.tsx` - Client component wrapper for Sanity components
- **Dynamic Imports**: Uses `next/dynamic` with `ssr: false` for proper server/client separation
- **Bundle Optimization**: Non-critical visual editing components load only when needed
- **Compatibility**: Resolves Next.js 15 server component restrictions with dynamic imports

### E-commerce Components
- **ProductCard**: Grid-compatible with Next.js Image optimization, author display, and intelligent stock status messaging showing lowest size stock for apparel
- **ProductListing**: Category filtering with Sanity CMS integration and live stock updates
- **AddToCart**: Enhanced button with smart disabled states, real-time stock validation, and apparel size awareness
- **SizeSelector**: Clean apparel size selection with minimal UI, strikethrough for sold-out sizes, and responsive grid
- **CartButton**: Layout-shift-optimized component with minimum width (4rem) and consistent spacing
- **CartPage**: Optimized checkout with 1-2 second flow, Stripe.js preloading, author display in cart items, and mobile-first responsive design
- **CartItem**: Cart-specific stock calculation with sophisticated quantity validation, author display, and responsive layout with proper mobile image sizing
- **SkeletonLoaders**: Responsive loading states matching mobile-first cart layout with full-width image skeletons

### Button Standardization System (2025)
- **Unified CTA Styling**: All primary buttons use `add-to-cart.module.css` for consistent behavior
- **Continue Shopping Buttons**: Standardized across empty cart, cart page, and success pages
- **Custom Easing Curve**: 100-point linear transition function (581.71ms duration) for premium feel
- **Interactive States**: Consistent hover (`rgb(32,32,32)`), active (`scale(0.95)`), and disabled states
- **Responsive Width**: Full width on mobile (`w-full`), auto width on desktop (`sm:w-auto`)
- **Accessibility**: Proper ARIA labels and disabled state handling with cursor management

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

### Homepage Unified Content System (2025)
- **Unified Content Blocks**: Modern `contentBlocks` array system replacing separate heroPair/heroSingle types
- **Three Layout Options**: Content editors can choose layout style for each content block via Sanity Studio dropdown
  - **2-Column Layout** (`layout: 'two'`): Images side by side with text below, breakpoint: `sm:col-span-6`
  - **3-Column Layout** (`layout: 'three'`): Text | Image | Image with tight spacing, breakpoint: `lg:col-span-4`
  - **Full-Width Layout** (`layout: 'full'`): Single image with text below, spans full 12 columns
- **Flexible Linking**: Optional product linking or custom external/internal links per content block
- **Draggable Reordering**: Sanity array fields provide native drag-and-drop functionality for content organization
- **Legacy Compatibility**: Existing `heroSections` content preserved and rendered alongside new `contentBlocks`
- **Visual Editing Support**: Real-time preview and layout switching in Sanity Studio presentation tool
- **Schema Implementation**: `studio/schemas/homepage.ts` with comprehensive content block definition

#### Content Block Schema
```tsx
// New unified content block structure
{
  type: 'object',
  name: 'contentBlock',
  fields: [
    {
      name: 'layout',
      type: 'string',
      options: {
        list: [
          { title: '2-Column: Images Side by Side (Text Below)', value: 'two' },
          { title: '3-Column: Text | Image | Image', value: 'three' },
          { title: 'Full Width: Single Image', value: 'full' },
        ],
      },
    },
    { name: 'title', type: 'string' },
    { name: 'caption', type: 'text' },
    { name: 'linkedProduct', type: 'reference', to: [{ type: 'product' }] },
    { name: 'customLink', type: 'object' },
    { name: 'leftImage', type: 'image' },
    { name: 'rightImage', type: 'image' },
  ],
}

// TypeScript interface
export interface SanityContentBlock {
  _type: 'contentBlock'
  layout: 'two' | 'three' | 'full'
  title: string
  caption?: string
  leftImage: SanityImage
  rightImage?: SanityImage
  linkedProduct?: SanityProductReference
  customLink?: { url: string; text?: string }
}
```

#### Migration Strategy
- **Backward Compatibility**: GROQ query fetches both `contentBlocks[]` and `heroSections[]`
- **Dual Rendering**: Homepage component renders both formats seamlessly
- **Legacy Preservation**: Existing content continues to function without migration
- **Future-Ready**: New content uses unified `contentBlocks` system with enhanced features

## Routing Structure

### App Router Implementation
- **Home**: `/` - Hero product showcases with three layout options: 2-column (images side by side), 3-column (text | image | image), and full-width
- **Products**: `/products/` - Product grid with category navigation and stock status
- **Product Detail**: `/products/[slug]/` - Dynamic pages with size selection and stock validation
- **Cart**: `/cart/` - Optimized checkout page with 1-2 second checkout flow, Stripe.js preloading, and real-time stock validation
- **Cart Demo**: `/cart/demo/` - Populates cart with sample items for testing
- **Static Generation**: `generateStaticParams` for build optimization

### API Routes

#### Core E-commerce APIs
- **Sanity Webhook**: `/api/sanity-stripe` - Auto-creates Stripe products when Sanity content is published, uses metadata for product descriptions
- **Optimized Checkout**: `/api/checkout` - **NEW** Single endpoint with rate limiting (5/min), combining stock validation + session creation for 1-2 second checkout
- **Checkout Session**: `/api/create-checkout-session` - Legacy endpoint (replaced by `/api/checkout`)
- **Stripe Webhook**: `/api/stripe-webhook` - Payment event processing with automatic stock deduction
- **Product Sync**: `/api/sync-existing-products` - Bulk migration utility using rich text system and metadata fields
- **Setup Categories**: `/api/setup-categories` - Automated category creation

#### Advanced Inventory Management APIs
- **Stock Reservation**: `/api/reserve-stock` - Atomic stock locking during checkout with session expiration
- **Stock Release**: `/api/release-stock` - Release reserved inventory on payment failure or timeout
- **Stock Status**: `/api/stock-status` - Real-time stock checking with GET/POST endpoints
- **Inventory Health**: `/api/inventory-health` - System health monitoring with cleanup triggers
- **Inventory Monitor**: `/api/inventory-monitor` - Advanced monitoring with overselling detection
- **Products Optimized**: `/api/products-optimized` - Cached, essential-fields-only product endpoint

#### Content Migration & Schema Management APIs (2025)
- **Homepage Content Migration**: `/api/migrate-homepage-content` - Safe migration from heroSections to contentBlocks with validation and rollback protection
- **Remove Legacy Heroes**: `/api/remove-hero-sections` - Clean removal of legacy heroSections field after migration
- **Cleanup Legacy Descriptions**: `/api/cleanup-legacy-descriptions` - Remove old plaintext description and vendor fields from products
- **Homepage Migration (Legacy)**: `/api/migrate-homepage` - Basic homepage content migration utility

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

#### Autonomous Inventory Management APIs
- **Autonomous Inventory**: `/api/autonomous-inventory` - Self-healing inventory system with intelligent response triggers
- **Inventory Sync**: `/api/inventory-sync` - Enhanced sync with consistency checks and automated remediation
- **Test Autonomous**: `/api/test-autonomous` - Test endpoint for validating autonomous system functionality

#### Cache Management & Debugging APIs
- **Clear Cache**: `/api/clear-cache` - Manual cache clearing for specific paths
- **Emergency Cache Clear**: `/api/emergency-cache-clear` - Immediate cache clearing for all product-related data
- **Test Revalidate**: `/api/test-revalidate` - Manual trigger for testing revalidation system
- **Debug Homepage**: `/api/debug-homepage` - Content migration debugging and GROQ query validation

#### Development Debugging Tools
- **Homepage Debug Page**: `/debug-homepage` - Visual debugging interface for content block migration
- **Content Inspection**: Real-time comparison between new contentBlocks and legacy heroSections
- **Migration Validation**: Automated analysis of content structure and GROQ query results
- **Schema Validation**: Real-time testing of GROQ queries and data structure integrity
- **Rich Text Testing**: Debug interface for Portable Text rendering and metadata display

#### Background Process APIs (Manual Trigger Only - Hobby Plan)
- **Cleanup Inventory**: `/api/cron/cleanup-inventory` - Manual cleanup of expired reservations and stale data
- **Health Check**: `/api/cron/health-check` - Manual system health monitoring and logging
- **Auto Remediation**: `/api/cron/auto-remediation` - Manual trigger for automated inventory issue fixing

#### Enhanced Error Handling
- **User-Friendly Messages**: Stock reservation errors now show "Sorry, someone else just grabbed one of these items!" instead of technical errors
- **Stripe Webhook Coverage**: Enhanced webhook handling for `checkout.session.expired` and `checkout.session.async_payment_failed`
- **Intelligent Cleanup**: Automatic stock release on payment failures and session expiration

#### Autonomous System Dashboards
- **Autonomous Status**: `/autonomous-status` - Real-time dashboard showing autonomous system health and automation status
- **Debug Page**: `/debug` - Technical debugging interface with stock calculations and raw data

### Route Patterns
```tsx
// Product detail page with size selection
/products/[slug]/page.tsx
/products/[slug]/product-page-client.tsx

// Checkout success pages (multiple variants)
/cart/success/page.tsx           // Original success page
/cart/success-new/page.tsx       // Enhanced success page with improved UX
/cart/test-persistence/page.tsx  // Cart persistence testing interface

// Static params generation (now uses Sanity data)
export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

// Webhook endpoint for Sanity-Stripe sync
/api/sanity-stripe/route.ts
```

### Key Directories

- `src/app/` - Next.js App Router pages and layouts
  - `src/app/page.tsx` - Homepage with unified content block system and legacy compatibility
  - `src/app/debug-homepage/` - Development debugging tools for content migration
  - `src/app/api/` - API routes for Sanity-Stripe integration and optimized checkout flow
- `src/components/` - Reusable React components with CSS modules
  - `src/components/portable-text.tsx` - Rich text rendering components for Sanity Portable Text
- `src/data/` - Type definitions and interfaces (mock data replaced by Sanity)
- `src/lib/` - Utilities, hooks, and shared logic
  - `src/lib/hooks/` - Custom React hooks (useLocaleCurrency)
  - `src/lib/utils/` - Utility functions (formatPrice)
  - `src/lib/sanity/` - Sanity client, queries, type definitions, and Live Content API
- `src/styles/` - Global CSS styles  
- `studio/` - Sanity Studio configuration and schemas
  - `studio/schemas/` - Product, category, and unified homepage content block schema definitions
- `public/images/` - Product images and static assets
- `public/webfonts/` - Custom Neue Haas Unica Pro font files (served statically)
- `src/webfonts/` - Source font files (copied to public during build)
- `scripts/` - Maintenance and setup scripts for inventory management
  - `scripts/fix-sanity-studio.js` - Fix Sanity Studio issues and initialize inventory fields
  - `scripts/verify-inventory-setup.js` - Verify autonomous inventory system configuration
  - `scripts/fix-sized-apparel-stock.js` - Remove main stockQuantity from sized apparel products
  - `scripts/reset-all-reservations.js` - Comprehensive reset of all inventory reservations
  - `scripts/init-reserved-quantity.js` - Initialize reservedQuantity fields for existing products

## Middleware & Security

### CORS Configuration
- **Middleware**: `src/middleware.ts` - Essential for Sanity Studio visual editing integration
- **Cross-Origin Requests**: Handles requests from Sanity Studio to site for real-time preview
- **Production Requirements**: Must configure CORS origins in Sanity project settings for visual editing
- **Security Headers**: SVG content security policies and safe external image handling

### Next.js 15.3.4 Configuration
```typescript
// next.config.ts - Modern security practices
const nextConfig: NextConfig = {
  images: {
    // Secure remote patterns (replaces deprecated domains)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
    // Performance optimizations
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    formats: ['image/webp', 'image/avif'],
    // Security hardening
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```

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

### Font Implementation (Performance Optimized 2024)
```css
@font-face {
  font-family: 'Neue Haas Unica';
  font-weight: 400 | 500 | 600;
  font-style: normal;
  font-display: swap; /* Prevents invisible text during font load */
  src: url(/webfonts/neue-haas-unica-pro-web.woff2) format("woff2"),
       url(/webfonts/neue-haas-unica-pro-web.woff) format("woff");
}

html, body {
  font-family: 'Neue Haas Unica', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Font preloading in layout.tsx */
<link
  rel="preload"
  href="/webfonts/neue-haas-unica-pro-web.woff2"
  as="font"
  type="font/woff2"
  crossOrigin=""
/>
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

**Fixed Sized Apparel Stock Detection (Latest):**
- **ProductCard Logic**: Fixed `hasSizes` detection to check actual `sanityProduct.variants` instead of non-existent properties
- **Main Stock Removal**: Sized apparel products now have `stockQuantity: null` to prevent confusion with variant-level stock
- **Proper Stock Display**: Resolved "(SOLD OUT)" showing incorrectly when sizes have available stock
- **Maintenance Scripts**: Added `fix-sized-apparel-stock.js` and `reset-all-reservations.js` for data cleanup

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

**Enhanced Error Messaging (2024):**
- **User-Friendly Language**: "Sorry, someone else just grabbed one of these items!" instead of "Unable to reserve stock for checkout"
- **Clear Next Steps**: Specific instructions like "Please refresh the page and try again"
- **Context-Aware**: Different messages for stock errors, rate limiting, and system issues
- **Reduced Anxiety**: Frames issues as normal shopping competition rather than system failures

**Product Page Title Cleanup (2024):**
- **Clean Individual Pages**: Removed stock status labels from product detail page titles (e.g., "Tote bag (black)" instead of "Tote bag (black) (SOLD OUT)")
- **Preserved Grid Messaging**: Stock labels remain on product listing pages for at-a-glance availability
- **Consistent Information**: Stock status still available in buttons, selectors, and descriptions

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

### Next.js 15.3.4 Image Loading Patterns (2025)
**Production-Ready Image Implementation:**
```tsx
import { ImageWithSkeleton } from '@/components/image-with-skeleton'

// Standard image with skeleton loading (recommended)
<ImageWithSkeleton
  src={imageUrl}
  alt={altText}
  width={800}
  height={600}
  quality={85} // Optimal balance for Next.js 15
  className="rounded" // Optional styling
  sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizing
  priority={false} // Set true for above-fold images
/>
```

**Progressive Loading for Slow Connections:**
```tsx
import { ProgressiveImage } from '@/components/progressive-image'

// Advanced progressive loading with pixelated placeholders
<ProgressiveImage
  src={imageUrl}
  alt={altText}
  width={800}
  height={600}
  quality={95} // Higher quality for progressive loading
/>
```

**Skeleton Loading States:**
```tsx
import { CartPageSkeleton } from '@/components/skeletons/cart-skeleton'

// Show skeleton while data loads
{loading ? <CartPageSkeleton /> : <ActualCartContent />}
```

**Button Standardization Pattern:**
```tsx
import styles from "@/components/add-to-cart.module.css"

// Consistent CTA styling across all primary buttons
<button className={`${styles.addToCart} additional-classes`}>
  BUTTON TEXT
</button>

// Link as button (for Continue Shopping, etc.)
<Link
  href="/products"
  className={`${styles.addToCart} inline-block text-center font-normal text-xs uppercase tracking-wide`}
>
  CONTINUE SHOPPING
</Link>
```

### Rich Text Content Implementation (2025)
**Portable Text Rendering with Custom Components:**
```tsx
// Import rich text renderer
import { ProductDescription } from '@/components/portable-text'

// Product page rendering
{sanityProduct?.richDescription && (
  <ProductDescription value={sanityProduct.richDescription} />
)}

// Metadata display with monospace styling
{sanityProduct?.metadata?.trim() && (
  <div className="mt-4 mb-6">
    <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
      {sanityProduct.metadata}
    </pre>
  </div>
)}
```

**Custom Portable Text Components:**
```tsx
const components = {
  block: {
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    h4: ({ children }) => <h4 className="text-lg font-medium mb-3 mt-6">{children}</h4>,
    h5: ({ children }) => <h5 className="text-base font-medium mb-2 mt-4">{children}</h5>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 text-black">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href || "#"}
        className="underline hover:no-underline text-blue-600 hover:text-blue-800 transition-colors"
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  },
}
```

**API Integration Patterns:**
```tsx
// Stripe product creation using metadata
const stripeDescription = product.metadata?.trim() || `${productName} - Available from Spooky Books`

const stripeProduct = await stripe.products.create({
  name: productName,
  description: stripeDescription, // Uses metadata instead of legacy description
  metadata: {
    sanity_id: product._id,
    sanity_slug: product.slug.current,
    vendor: "Spooky Books",
    ...(product.author && { author: product.author }),
  },
})
```

**GROQ Query Updates:**
```groq
// Updated product queries without legacy description field
*[_type == "product"]{
  "id": slug.current,
  title,
  author,
  richDescription,  // Rich text array
  metadata,         // Technical details string
  price,
  stockQuantity,
  // ... other fields
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

#### Cart Persistence Implementation (2024)
**Seamless Cart Recovery Across Sessions:**
- **localStorage Integration**: Cart data persists across page reloads, tab closures, and browser restarts
- **Automatic Hydration**: Cart state restored on app load without user intervention
- **Version Control**: Cart schema versioning prevents compatibility issues during updates
- **Expiration Logic**: 30-day automatic cleanup of stale cart data
- **Error Handling**: Graceful fallback when localStorage is unavailable or corrupt
- **Stripe Flow Preservation**: Cart survives Stripe redirect cancellation (only cleared on payment success)

**Technical Implementation:**
```tsx
// localStorage utilities with error handling
const storage = {
  get: (): StoredCart | null => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    const data: StoredCart = JSON.parse(stored)
    
    // Version compatibility check
    if (data.version !== CART_VERSION) {
      storage.clear()
      return null
    }
    
    // Expiration check (30 days)
    const daysSinceStored = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24)
    if (daysSinceStored > CART_EXPIRY_DAYS) {
      storage.clear()
      return null
    }
    
    return data
  },
  
  set: (items: CartItem[]): void => {
    const data: StoredCart = {
      items,
      timestamp: Date.now(),
      version: CART_VERSION
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data))
  }
}

// Cart provider with persistence
export function CartProvider({ children }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedCart = storage.get()
    if (storedCart?.items?.length > 0) {
      setCart(storedCart.items)
    }
    setIsHydrated(true)
  }, [])

  // Auto-save cart changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      storage.set(cart)
    }
  }, [cart, isHydrated])
}
```

**Cart Clearing Behavior:**
- **Page Reload**: ✅ Cart persists
- **Tab Close/Reopen**: ✅ Cart persists
- **Browser Restart**: ✅ Cart persists (30 days)
- **Stripe Cancel**: ✅ Cart persists (returns to /cart)
- **Stripe Success**: ❌ Cart cleared (at /cart/success)
- **Manual Clear**: ❌ Cart cleared from both memory and localStorage

**Testing Endpoint:**
- **Development**: `/cart/test-persistence` - Interactive testing interface for cart persistence behavior

#### Unified Content Block Implementation (2025)
```tsx
// Homepage with unified content system
import type { SanityContentBlock, SanityHeroSection } from "@/lib/sanity/types"

// Dual rendering for backward compatibility
{/* New unified content blocks */}
{homepage.contentBlocks?.map((block: SanityContentBlock, index: number) => (
  <ContentBlock key={`content-${index}`} block={block} />
))}

{/* Legacy hero sections for backward compatibility */}
{homepage.heroSections?.map((section: SanityHeroSection, index: number) => (
  <HeroSection key={`hero-${index}`} section={section} />
))}

// Unified content block component with layout variants
function ContentBlock({ block }: { block: SanityContentBlock }) {
  const link = getLink(block) // Product or custom link resolution
  
  if (block.layout === 'full') {
    return <ContentBlockFullWidth block={block} link={link} />
  } else if (block.layout === 'two') {
    return <ContentBlockTwoColumn block={block} link={link} />
  } else {
    return <ContentBlockThreeColumn block={block} link={link} />
  }
}

// GROQ query supporting both formats
export const homepageQuery = `*[_type == "homepage"][0]{
  title,
  contentBlocks[]{ /* new unified blocks */ },
  heroSections[]{ /* legacy compatibility */ }
}`
```

#### Visual Editing Usage (Next.js 15 Optimized - Fixed 2024)
```tsx
// Homepage with real-time Sanity data
import { sanityFetch } from '@/lib/sanity/live'
import { VisualEditingProvider } from '@/components/visual-editing-provider'

// Live query with tags for selective revalidation  
const { data } = await sanityFetch({
  query: homepageQuery,
  tags: ['homepage']
})

// Layout with optimized visual editing components
function RootLayout({ children }) {
  const { isEnabled } = await draftMode()
  
  return (
    <html>
      <head>
        {/* Font preloading for performance */}
        <link rel="preload" href="/webfonts/neue-haas-unica-pro-web.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <CartProvider>
          {children}
          <Toaster position="bottom-right" />
          <VisualEditingProvider isEnabled={isEnabled} />
        </CartProvider>
      </body>
    </html>
  )
}

// VisualEditingProvider component (client-side only)
'use client'
import dynamic from 'next/dynamic'

const VisualEditing = dynamic(
  () => import('next-sanity').then(mod => ({ default: mod.VisualEditing })),
  { ssr: false, loading: () => null }
)

const SanityLive = dynamic(
  () => import('@/lib/sanity/live').then(mod => ({ default: mod.SanityLive })),
  { ssr: false, loading: () => null }
)

export function VisualEditingProvider({ isEnabled }) {
  return (
    <>
      {isEnabled && <VisualEditing />}
      <SanityLive />
    </>
  )
}

// Fixed Draft Mode API Implementation
// src/app/api/draft-mode/enable/route.ts
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

export async function GET(request: NextRequest) {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    sanityClient.withConfig({ token: process.env.SANITY_VIEWER_TOKEN! }),
    request.url,
  )

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 })
  }

  // Next.js 15: draftMode() returns a Promise
  const draft = await draftMode()
  draft.enable()
  
  redirect(redirectTo)
}

// Fixed Presentation Tool Configuration
// studio/sanity.config.ts
import { defineLocations, defineUrlResolver } from 'sanity/presentation'

presentationTool({
  resolve: {
    locations: {
      homepage: defineLocations({
        select: { title: 'title', slug: 'slug.current' },
        resolve: (doc) => ({ locations: [{ title: 'Homepage', href: '/' }] }),
      }),
      product: defineLocations({
        select: { title: 'title', slug: 'slug.current' },
        resolve: (doc) => ({ locations: [{ title: doc.title || 'Untitled', href: `/products/${doc.slug}` }] }),
      }),
    },
    mainDocuments: defineUrlResolver({
      filter: `_type == "product" && defined(slug.current)`,
      resolve: (doc) => ({ href: `/products/${doc.slug?.current}` }),
    }),
  },
  previewUrl: {
    previewMode: { enable: '/api/draft-mode/enable' },
  },
}),
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

### Current Technology Stack (2025)
- **Next.js**: 15.3.4 (latest stable)
- **React**: 19.0.0 (latest stable)
- **TypeScript**: 5 (latest)
- **Tailwind CSS**: 4.1.10 (latest)
- **Sanity**: @sanity/client 7.6.0, next-sanity 9.12.0
- **Stripe**: stripe 18.2.1, @stripe/stripe-js 7.3.1
- **Sonner**: 2.0.5 (toast notifications)

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

### Vercel Configuration (Hobby Plan Optimized)
**Current vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Important Notes:**
- **Cron Jobs Removed**: Vercel cron jobs are not available on hobby plan, causing deployment failures
- **Background Processes**: Rely on Stripe webhooks instead of cron for inventory cleanup
- **Manual Triggers**: Background process APIs can be triggered manually if needed

### Webhook Configuration
1. **Sanity Webhook**: Configure webhook in Sanity Studio to trigger `/api/sanity-stripe` on document publish
2. **Event Types**: Listen for `create`, `update`, `delete` events on product and homepage documents
3. **Automatic Sync**: Creates Stripe products/prices with author attribution and saves IDs back to Sanity
4. **Page Revalidation**: Automatic revalidation of affected pages via `/api/revalidate` webhook
5. **Vercel Optimization**: Selective revalidation reduces build usage on free tier

### Visual Editing Setup (Next.js 15 Optimized - Fixed 2024)
1. **Draft Mode API**: Secure implementation using `@sanity/preview-url-secret` with `validatePreviewUrl`
   - **Fixed "Invalid secret" Error**: Replaced `defineEnableDraftMode` with proper secret validation
   - **Endpoint**: `/api/draft-mode/enable` - validates preview URL secrets and redirects safely
   - **Token**: Uses SANITY_VIEWER_TOKEN for authentication
2. **Presentation Tool**: Enhanced configuration with proper location resolvers
   - **Location Mapping**: `defineLocations` for homepage and product document types
   - **URL Resolution**: `defineUrlResolver` for automatic preview URL generation
   - **Filter Support**: GROQ filter for `_type == "product" && defined(slug.current)`
3. **Live Content API**: Real-time updates using `defineLive` with `sanityFetch` and `SanityLive`
4. **Server/Client Separation**: `SanityLive` in root layout (server component), `VisualEditing` dynamically imported for client
5. **Component Architecture**: 
   - `VisualEditingProvider` - Client component wrapper with `ssr: false` dynamic imports
   - `SanityLive` - Server component in root layout for proper `defineLive` context
6. **Document Locations**: Homepage and product location mapping for editor navigation
7. **Studio Structure**: Custom structure with homepage singleton prominently displayed
8. **CORS Configuration**: Middleware handles cross-origin requests from Sanity Studio
9. **Click-to-Edit**: Visual overlays with stega encoding for instant content editing

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
- **Legacy Cleanup**: Safe removal of deprecated fields with migration validation
- **Content Migration**: Automated conversion between content formats with rollback protection

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

### Production Readiness & Recent Fixes (2024)
**Critical Production Issues Fixed:**
- **React Server Component Error**: Fixed `defineLive can only be used in React Server Components` by moving `SanityLive` to root layout
- **Font Loading Issues**: Moved fonts from `src/webfonts/` to `public/webfonts/` to resolve 404 errors
- **Vercel Deployment Failures**: Removed cron job configuration incompatible with hobby plan
- **TypeScript Compilation**: Fixed all type errors and ESLint warnings for production builds

**Build Optimization:**
- Production builds complete in ~6-7 seconds
- 52 static pages pre-generated successfully  
- Bundle size optimized with dynamic imports and code splitting
- All warnings addressed (only minor unused parameter warnings remain)

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

### CORS Configuration (Required for Visual Editing)
**Important**: Visual editing will fail without proper CORS setup. Add production URL to Sanity project:

1. **Navigate to Sanity CORS Settings**: https://sanity.io/manage/project/0gbx06x6/api
2. **Click "Add CORS Origin"** or use direct link: https://sanity.io/manage/project/0gbx06x6/api?cors=add&origin=https%3A%2F%2Fspooky-books-next.vercel.app
3. **Add Production URL**: `https://spooky-books-next.vercel.app`
4. **Enable Credentials**: Check "Allow credentials" checkbox
5. **Save**: Confirm CORS origin addition

**Common CORS Errors Fixed:**
- `Failed to load resource: net::ERR_FAILED` on Sanity Live API
- `Unable to connect to visual editing` in presentation tool
- `Access to fetch...has been blocked by CORS policy` console errors
- `PostMessage origin mismatch` errors between Studio and site

### Visual Editing Access (Fixed 2024)
1. **Studio Access**: Visit https://spooky-books.sanity.studio
2. **Presentation Mode**: Click "Presentation" tab in studio
3. **Homepage Editing**: Select "Homepage" → Live preview opens with secure URL validation
4. **Layout Selection**: Choose layout style (2-column, 3-column) for each hero section
5. **Real-time Updates**: Changes appear instantly in live preview
6. **Content Management**: Add/edit hero sections with layout-specific preview
7. **Fixed Issues**: 
   - ✅ Resolved "Invalid secret" error when opening presentation mode
   - ✅ Fixed blank screen issue with proper `@sanity/preview-url-secret` implementation
   - ✅ Enhanced document location mapping for better navigation
   - ✅ Secure preview URL generation with proper authentication

### Webhook Configuration
**Required Webhooks:**
1. **Sanity → Stripe Sync**: 
   - URL: `https://spooky-books-next.vercel.app/api/sanity-stripe`
   - Events: Document create, update, delete
   - Filter: `_type == "product"`
   - Purpose: Auto-creates Stripe products and saves IDs back to Sanity

2. **Sanity → Frontend Revalidation**: 
   - URL: `https://spooky-books-next.vercel.app/api/revalidate`  
   - Events: Document create, update, delete
   - Filter: `_type == "product" || _type == "homepage"`
   - Purpose: Immediate cache clearing and page updates

**Stripe Webhook Enhancement (2024):**
- Enhanced `checkout.session.expired` handling for automatic stock release
- Added `checkout.session.async_payment_failed` for improved error coverage
- Replaces most manual cleanup needs previously handled by cron jobs

**Rich Text Migration (2025):**
- Product descriptions migrated from plaintext to Portable Text with rich formatting
- Metadata field added for technical specifications with monospace display
- Stripe product descriptions now use metadata field for better product information
- All GROQ queries updated to use new field structure without legacy description

### Alternative to Cron Jobs (Hobby Plan Compatible)
**Since Vercel cron jobs are not available on hobby plan:**
- **Primary Cleanup**: Stripe webhooks handle session expiration and failures
- **Manual Triggers**: Background process APIs available for manual execution
- **Monitoring**: `/autonomous-status` dashboard for system health checks
- **Cache Management**: `/api/emergency-cache-clear` for immediate cache fixes

## Performance Optimizations (2024)

### Core Web Vitals Optimizations
- **Image Optimization**: Responsive sizing (800x600, 1200x800), quality reduction (100→85), lazy loading for non-critical images
- **Font Performance**: `font-display: swap` prevents invisible text, WOFF2 prioritization, preloading for critical fonts
- **Bundle Splitting**: Client component wrapper (`VisualEditingProvider`) for Next.js 15 compatibility with dynamic imports
- **Layout Shift Prevention**: Reserved space for dynamic content, consistent button sizing, minimum cart button width
- **Build Performance**: Development server ready in 1.5s, production build in 6s, optimized bundle sizes (~170kB)

### Advanced Optimizations
- **Static Generation**: Pre-built product pages for optimal loading
- **Code Splitting**: Automatic with Next.js App Router + manual optimization for non-critical components
- **CSS Optimization**: Tailwind CSS with PostCSS for minimal bundle size
- **Webhook Efficiency**: Optimized Stripe API calls with error handling and retry logic

### Performance Results
- **Homepage**: Reduced image sizes by 15-30% with quality optimization
- **Visual Editing**: Non-blocking component loading with `ssr: false` dynamic imports
- **Cart Interface**: Prevented layout shifts with consistent component sizing
- **Build Time**: Consistent sub-10 second production builds with full static generation

## Accessibility Features

- **Keyboard Navigation**: Proper focus management and keyboard accessibility
- **ARIA Labels**: Proper labeling for interactive elements
- **Screen Readers**: Descriptive text for cart quantities and product info
- **Color Contrast**: Proper contrast ratios for light mode
- **Semantic HTML**: Proper heading hierarchy and landmark elements

## Quick Reference Guide

### Deployment

#### Pre-deployment
```bash
# Run full validation suite
npm run lint && npm run build
```

#### Vercel Configuration
- Automatic deployments from main branch
- Environment variables in Vercel dashboard
- Webhooks configured for Sanity → Stripe sync
- CORS enabled for visual editing

#### Post-deployment
- Test visual editing at `/studio`
- Verify webhooks with test product
- Check cart persistence across sessions
- Monitor rate limiting at `/api/rate-limit-stats`

### Common Tasks

#### Add New Product Type
1. Update Sanity schema with new fields
2. Add TypeScript types to `lib/sanity/types.ts`
3. Update product components for new logic
4. Test inventory management for edge cases

#### Debug Stock Issues
```bash
# Check inventory health
GET /api/inventory-health

# View autonomous system status
Visit /autonomous-status

# Manual cleanup if needed
POST /api/cron/cleanup-inventory
```

#### Fix Common Issues
- **"Unknown field" in Sanity**: Run `/api/cleanup-reserved-fields`
- **Missing variant keys**: Run `/api/fix-variant-keys`
- **Stale cache**: Run `/api/emergency-cache-clear`
- **TypeScript errors**: Check `npm run build` output for type validation

### Best Practices

#### Development Standards
- **Always validate types**: Use TypeScript strict mode, no `any` types
- **Test edge cases**: Empty cart, sold out items, concurrent checkouts
- **Handle errors gracefully**: User-friendly messages, no technical jargon
- **Optimize for mobile**: Test on real devices, not just browser DevTools

#### Performance Guidelines
- **Monitor performance**: Keep checkout under 2 seconds, minimize bundle size
- **Use semantic HTML**: Proper ARIA labels, keyboard navigation
- **Follow conventions**: Kebab-case files, named exports, consistent formatting

#### Content Management
- **Rich Text**: Use Portable Text for descriptions, metadata for technical specs
- **Image Optimization**: Always include alt text, use Next.js Image component
- **Stock Management**: Test variant-level stock, validate cart quantities
- **Visual Editing**: Test presentation mode after schema changes