# Spooky Books - E-commerce Platform

A modern e-commerce platform for book and apparel sales, built with Next.js 15, Sanity CMS, and Stripe payments. Features **production-ready inventory management** with race condition protection, real-time stock validation, and comprehensive monitoring.

> **🎉 Latest Update**: Comprehensive inventory management system implemented and tested. Zero overselling protection with real-time stock updates across all components.

## Features

### 🛒 E-commerce Core
- Product catalog with categories (Publications, Apparel)
- Shopping cart with real-time stock validation
- Secure checkout with Stripe payments
- Variant support for apparel sizing

### 📦 Inventory Management (Production Ready)
- **Real-time stock validation** - Prevents adding more items than available
- **Zero overselling protection** - Multiple validation layers ensure accuracy
- **Race condition prevention** - Sanity atomic transactions handle concurrent users
- **Smart stock reservations** - 30-minute holds during checkout process
- **Automatic stock deduction** - Webhook-triggered updates on payment success
- **Comprehensive monitoring** - Proactive detection of stock issues
- **Clean team UX** - System fields hidden from Sanity Studio interface

### 💰 Dynamic Pricing (New!)
- **Single source of truth** - All prices managed in Sanity CMS only
- **Instant price updates** - Change price in Sanity, checkout immediately reflects it
- **No Stripe Price ID management** - Eliminates complex Stripe configuration
- **Foolproof pricing** - Customers always pay exactly what they see
- **Team-friendly** - Just set price in Sanity, system handles the rest

### 🔧 Technical Features
- Server-side rendering with Next.js App Router
- TypeScript for type safety
- Sanity CMS for content management
- Stripe integration for payments
- Real-time updates with Sanity Live Content API
- Comprehensive error logging and monitoring
- Idempotency protection for webhook processing

## Architecture

### Stock Management Flow
1. **Frontend Validation** - Real-time stock checks before adding to cart
2. **Stock Reservation** - Items temporarily reserved during checkout (30 min)
3. **Payment Processing** - Stripe handles secure payment collection with dynamic pricing
4. **Stock Deduction** - Successful payments trigger permanent stock reduction
5. **Cleanup** - Failed/expired sessions release reserved stock

### Dynamic Pricing Flow
1. **Price Management** - Team sets prices in Sanity CMS only
2. **Real-time Sync** - Checkout API fetches current prices from Sanity
3. **Customer Charged** - Stripe charges exactly what's displayed in frontend
4. **No Configuration** - No Stripe Price IDs or manual sync required

### Key Components
- `src/lib/utils/stock-validation.ts` - Real-time stock calculation and validation
- `src/lib/sanity/stock-operations.ts` - Atomic stock operations with race condition protection
- `src/lib/utils/inventory-monitoring.ts` - Comprehensive monitoring and issue detection
- `src/app/api/stripe-webhook/route.ts` - Webhook event processing for stock updates
- `src/components/add-to-cart.tsx` - Cart-aware stock validation UI
- `src/components/cart-item.tsx` - Enhanced cart items with stock controls
- `src/components/size-selector.tsx` - Real-time variant stock display

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Sanity account
- Stripe account

### Environment Variables
Create a `.env.local` file:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Sanity Studio:**
```bash
npm run studio:dev
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## API Endpoints

### Stock Management
- `POST /api/reserve-stock` - Reserve stock for checkout
- `POST /api/release-stock` - Release reserved stock
- `GET /api/stock-status` - Check current stock levels
- `POST /api/stock-status` - Validate cart items stock

### Stripe Integration
- `POST /api/create-checkout-session` - Create Stripe checkout with stock reservation
- `POST /api/stripe-webhook` - Process Stripe webhook events

### System Health & Monitoring
- `GET /api/inventory-health` - Comprehensive inventory system health check
- `POST /api/inventory-health` - Trigger manual cleanup
- `GET /api/inventory-monitor` - Advanced monitoring with issue detection
- `POST /api/inventory-monitor` - Run full inventory report
- `POST /api/init-reserved-quantity` - Initialize reservedQuantity fields (one-time setup)

## Sanity Schemas

### Core Schemas
- `product.ts` - Products with stock tracking and variants
- `category.ts` - Product categories
- `homepage.ts` - Homepage content management

### Inventory Schemas
- `stock-reservation.ts` - Temporary stock holds
- `idempotency-record.ts` - Prevent duplicate operations
- `error-log.ts` - System error tracking

## Stripe Webhook Events

The system handles these Stripe events:
- `checkout.session.completed` - Log successful checkout
- `checkout.session.expired` - Release reserved stock
- `payment_intent.succeeded` - Deduct stock permanently
- `payment_intent.payment_failed` - Release reserved stock

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main
4. **Initialize inventory system**: `POST /api/init-reserved-quantity` (run once after first deployment)

### Other Platforms
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure environment variables
4. Set up Stripe webhook endpoint
5. **Initialize inventory system**: `POST /api/init-reserved-quantity` (run once after deployment)

### Post-Deployment Setup
```bash
# 1. Initialize inventory system (one-time setup)
curl -X POST https://yourdomain.com/api/init-reserved-quantity

# 2. Verify system health
curl https://yourdomain.com/api/inventory-health

# 3. Test stock validation
curl https://yourdomain.com/api/stock-status?productIds=halloween-tee,railcam
```

## Configuration

### Webhook Setup
1. In Stripe Dashboard, create webhook endpoint: `https://yourdomain.com/api/stripe-webhook`
2. Select events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Sanity Configuration
1. Deploy Sanity Studio: `npm run studio:deploy`
2. Configure CORS in Sanity for your domain
3. Set up API tokens with appropriate permissions

## Monitoring

### Automated Monitoring
The system includes comprehensive monitoring that automatically detects:
- ❌ **Negative stock quantities** (critical issues)
- ❌ **Reserved quantities exceeding total stock**
- ❌ **High reservation failure rates**
- ❌ **Suspicious reservation patterns during traffic spikes**

### Health Check Endpoints
```bash
# Quick system health check
GET /api/inventory-health

# Comprehensive monitoring report
GET /api/inventory-monitor?check=full-report

# Check for overselling issues only
GET /api/inventory-monitor?check=overselling

# Check for race condition patterns
GET /api/inventory-monitor?check=race-conditions
```

### Manual Monitoring
```bash
# Run comprehensive monitoring check
POST /api/inventory-monitor

# Trigger manual cleanup if needed
POST /api/inventory-health
```

### Key Metrics Tracked
- Active stock reservations vs total stock
- Expired reservations requiring cleanup
- Recent error frequency (per hour)
- Webhook processing success rate
- Products with stock inconsistencies
- Reservation pattern analysis

## Development

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── products/          # Product pages
│   └── cart/              # Cart and checkout
├── components/            # React components
├── contexts/              # React contexts
├── lib/
│   ├── sanity/           # Sanity client and operations
│   └── utils/            # Utility functions
└── styles/               # Global styles

studio/
├── schemas/              # Sanity schema definitions
└── sanity.config.ts     # Studio configuration
```

### Adding New Features
1. Follow existing patterns for stock validation
2. Use atomic transactions for stock operations
3. Implement proper error handling and logging
4. Add TypeScript interfaces for new data structures
5. Test with various edge cases (concurrent users, network failures)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript typing
4. Test thoroughly, especially inventory edge cases
5. Submit a pull request

## License

MIT License - see LICENSE file for details