# Inventory Management System

This document provides detailed information about the comprehensive inventory management system implemented for the Spooky Books e-commerce platform.

## Overview

The inventory management system ensures that users cannot purchase more items than are available in stock, prevents race conditions where multiple users could order the same last item, and automatically maintains stock levels as orders are processed through Stripe.

## Architecture

### Core Components

1. **Stock Validation** (`src/lib/utils/stock-validation.ts`)
   - Real-time stock calculation considering reserved quantities
   - Cart-level validation for multiple items
   - Product-specific validation for individual items

2. **Stock Operations** (`src/lib/sanity/stock-operations.ts`)
   - Atomic stock reservation using Sanity transactions
   - Stock release for failed/expired sessions
   - Permanent stock deduction on successful payments

3. **Webhook Processing** (`src/app/api/stripe-webhook/route.ts`)
   - Handles Stripe payment events
   - Triggers appropriate stock operations
   - Includes idempotency protection

4. **Error Handling** (`src/lib/utils/error-handling.ts`)
   - Comprehensive error logging to Sanity
   - Retry logic with exponential backoff
   - Health monitoring and cleanup functions

## Stock Flow

### 1. Frontend Validation
- Users see real-time stock availability
- Cart prevents adding items beyond available stock
- Immediate feedback on stock limitations

### 2. Checkout Reservation
- Stock is temporarily reserved when checkout session is created
- 30-minute reservation window matches Stripe session expiration
- Atomic transactions prevent race conditions

### 3. Payment Processing
- Stripe processes payment securely
- Webhook events trigger inventory updates
- Stock is either deducted (success) or released (failure)

### 4. Cleanup & Monitoring
- Expired reservations are automatically cleaned up
- Health monitoring tracks system performance
- Error logging provides debugging information

## Database Schema

### Products with Stock Tracking

```typescript
// Core product fields
{
  _type: 'product',
  title: string,
  stockQuantity: number,
  reservedQuantity: number, // Managed automatically
  variants?: [{
    size: string,
    stockQuantity: number,
    reservedQuantity: number, // Managed automatically
    stripePriceId: string
  }]
}
```

### Supporting Schemas

1. **Stock Reservations** - Track temporary holds
2. **Idempotency Records** - Prevent duplicate operations
3. **Error Logs** - System monitoring and debugging

## API Endpoints

### Stock Management

#### `POST /api/reserve-stock`
Reserve stock for checkout process.

**Request:**
```json
{
  "operations": [
    {
      "productId": "product-slug",
      "quantity": 2,
      "size": "M" // Optional for apparel
    }
  ],
  "sessionId": "stripe-session-id",
  "expirationMinutes": 30
}
```

**Response:**
```json
{
  "success": true,
  "errors": []
}
```

#### `POST /api/release-stock`
Release previously reserved stock.

**Request:**
```json
{
  "operations": [
    {
      "productId": "product-slug",
      "quantity": 2,
      "size": "M"
    }
  ]
}
```

#### `GET /api/stock-status?productIds=slug1,slug2`
Check current stock levels for products.

**Response:**
```json
{
  "success": true,
  "stockStatus": [
    {
      "productId": "product-slug",
      "title": "Product Name",
      "totalStock": 10,
      "reservedStock": 2,
      "availableStock": 8,
      "inStock": true
    }
  ]
}
```

#### `POST /api/stock-status`
Validate stock for multiple cart items.

**Request:**
```json
{
  "items": [
    {
      "productId": "product-slug",
      "quantity": 2,
      "size": "M"
    }
  ]
}
```

### System Health

#### `GET /api/inventory-health`
Check system health and metrics.

**Response:**
```json
{
  "healthy": true,
  "issues": [],
  "metrics": {
    "totalReservations": 15,
    "expiredReservations": 2,
    "recentErrors": 0
  },
  "system": {
    "timestamp": "2024-01-01T00:00:00Z",
    "uptime": 3600,
    "nodeVersion": "v18.0.0",
    "environment": "production"
  }
}
```

#### `POST /api/inventory-health`
Trigger manual cleanup of expired reservations and idempotency records.

## Stripe Webhook Events

### Handled Events

1. **`checkout.session.completed`**
   - Logs successful checkout for analytics
   - Stock deduction handled by `payment_intent.succeeded`

2. **`checkout.session.expired`**
   - Releases reserved stock when session expires
   - Cleans up reservation metadata

3. **`payment_intent.succeeded`**
   - Permanently deducts stock from inventory
   - Reduces both actual and reserved quantities

4. **`payment_intent.payment_failed`**
   - Releases reserved stock on payment failure
   - Allows other customers to purchase items

### Webhook Security
- Signature verification using Stripe webhook secret
- Idempotency protection prevents duplicate processing
- Error logging for failed webhook processing

## Error Handling & Monitoring

### Error Types
- `stock_validation` - Stock validation failures
- `stock_reservation` - Reservation process errors
- `stock_deduction` - Payment processing stock errors
- `webhook_processing` - Webhook handling errors

### Monitoring Features
- Health check endpoint for system status
- Automatic cleanup of expired data
- Error severity levels (low, medium, high, critical)
- Retry logic with exponential backoff

### Key Metrics
- Active stock reservations
- Expired reservations requiring cleanup
- Recent error frequency
- Webhook processing success rate

## Best Practices

### Development
1. Always use atomic transactions for stock operations
2. Implement proper error handling and logging
3. Test edge cases (concurrent users, network failures)
4. Use TypeScript interfaces for type safety
5. Follow existing patterns for consistency

### Deployment
1. Set up Stripe webhook endpoint correctly
2. Configure environment variables securely
3. Monitor health check endpoint regularly
4. Set up alerts for high error rates
5. Test webhook processing in staging environment

### Maintenance
1. Regular cleanup of expired records
2. Monitor system health metrics
3. Review error logs for patterns
4. Update stock levels through Sanity Studio
5. Test backup and recovery procedures

## Troubleshooting

### Common Issues

1. **Stock Reservations Not Releasing**
   - Check webhook endpoint configuration
   - Verify Stripe webhook secret
   - Run manual cleanup via `/api/inventory-health`

2. **Race Condition Errors**
   - Ensure atomic transactions are being used
   - Check for proper error handling in stock operations
   - Review concurrent user scenarios

3. **Webhook Processing Failures**
   - Verify webhook signature validation
   - Check Stripe event types configuration
   - Review error logs in Sanity Studio

### Debug Tools
- Health check endpoint: `/api/inventory-health`
- Stock status endpoint: `/api/stock-status`
- Error logs in Sanity Studio (hidden from main interface)
- Stripe webhook logs in Stripe Dashboard

## Future Enhancements

### Potential Improvements
1. Real-time stock notifications to users
2. Automatic reorder points and inventory alerts
3. Bulk stock update tools
4. Advanced analytics and reporting
5. Integration with warehouse management systems
6. Multi-location inventory support
7. Pre-order and backorder functionality

### Scalability Considerations
1. Database query optimization for high traffic
2. Caching strategies for frequently accessed stock data
3. Queue-based processing for webhook events
4. Horizontal scaling of API endpoints
5. CDN integration for real-time stock updates