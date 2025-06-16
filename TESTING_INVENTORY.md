# Inventory Management Testing Suite

## Test Environment
- Development server: http://localhost:3002
- Testing Date: 2025-06-16
- Focus: Real-time inventory management functionality

## Test Scenarios

### 1. Product Page Stock Display Tests

#### Test 1.1: Publication Stock Display
**Goal**: Verify real-time stock countdown for publications
**Steps**:
1. Navigate to a publication product page (e.g., /products/railcam)
2. Note initial stock display (e.g., "ONLY 5 LEFT")
3. Add 1 item to cart
4. Verify stock display updates to "ONLY 4 LEFT"
5. Add more items until stock is exhausted
6. Verify button changes to "SOLD OUT"

**Expected Results**:
- Stock count decreases with each addition
- Button becomes disabled when stock = 0
- Real-time updates without page refresh

#### Test 1.2: Apparel Variant Stock Display
**Goal**: Verify size-specific stock management
**Steps**:
1. Navigate to apparel product (e.g., /products/halloween-tee)
2. Select size M (shows "ONLY 2 LEFT" in screenshot)
3. Add 1 item to cart
4. Verify size M shows "ONLY 1 LEFT"
5. Add 1 more item
6. Verify size M shows "SOLD OUT"
7. Switch to size S
8. Verify size S shows correct independent stock

**Expected Results**:
- Each size maintains independent stock count
- Size-specific stock updates correctly
- Size selector disables out-of-stock sizes

### 2. Cart Page Functionality Tests

#### Test 2.1: Cart Stock Validation
**Goal**: Ensure cart enforces stock limits
**Steps**:
1. Add item to cart from product page
2. Navigate to cart page
3. Use quantity controls to increase quantity
4. Verify maximum quantity respects available stock
5. Try to exceed stock limit
6. Verify controls prevent exceeding stock

**Expected Results**:
- Quantity controls respect stock limits
- Warning messages appear for stock issues
- Cannot exceed available stock

#### Test 2.2: Multi-Item Stock Management
**Goal**: Test stock across multiple cart items
**Steps**:
1. Add same product multiple times (different sessions)
2. Verify total quantity respects stock limits
3. Add different products to cart
4. Verify each product's stock is tracked independently

### 3. Add to Cart Button Tests

#### Test 3.1: Stock Depletion Scenarios
**Goal**: Verify button states change correctly
**Steps**:
1. Find product with low stock (1-2 items)
2. Add items until stock depleted
3. Verify button changes to "SOLD OUT"
4. Verify button is disabled
5. Verify toast messages are appropriate

#### Test 3.2: Insufficient Stock Prevention
**Goal**: Prevent adding more than available
**Steps**:
1. Add maximum available stock to cart
2. Try to add one more item
3. Verify error toast appears
4. Verify item is not added to cart

### 4. Checkout Flow Tests

#### Test 4.1: Pre-Checkout Stock Validation
**Goal**: Validate stock before payment
**Steps**:
1. Add items to cart
2. Proceed to checkout
3. If stock changed, verify error message
4. Verify checkout blocked for out-of-stock items

#### Test 4.2: Stock Reservation During Checkout
**Goal**: Test stock reservation system
**Steps**:
1. Add items to cart
2. Create checkout session
3. Verify stock is reserved (not available to others)
4. Let session expire (30 minutes)
5. Verify stock is released

### 5. Race Condition Tests

#### Test 5.1: Concurrent User Simulation
**Goal**: Test multiple users competing for last item
**Steps**:
1. Open product page in multiple browser tabs
2. Add same product to cart in both tabs
3. Verify only one succeeds when stock = 1
4. Verify proper error handling

#### Test 5.2: Rapid Clicking Prevention
**Goal**: Prevent double-adding from rapid clicks
**Steps**:
1. Rapidly click "Add to Cart" button
2. Verify only appropriate quantity is added
3. Verify no duplicate cart items

### 6. Error Handling Tests

#### Test 6.1: Network Failure Scenarios
**Goal**: Test behavior during network issues
**Steps**:
1. Disable network connection
2. Try to add items to cart
3. Verify appropriate error messages
4. Restore connection
5. Verify system recovers correctly

#### Test 6.2: Invalid Stock Data
**Goal**: Handle corrupted or missing stock data
**Steps**:
1. Test with products missing stock information
2. Verify graceful fallback behavior
3. Verify no crashes or infinite loops

### 7. API Endpoint Tests

#### Test 7.1: Stock Status API
**Goal**: Validate /api/stock-status endpoint
**Steps**:
```bash
# Test single product stock check
curl -X GET "http://localhost:3002/api/stock-status?productIds=halloween-tee"

# Test multiple products
curl -X POST "http://localhost:3002/api/stock-status" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"halloween-tee","quantity":1,"size":"M"}]}'
```

#### Test 7.2: Stock Reservation API
**Goal**: Test stock reservation functionality
**Steps**:
```bash
# Reserve stock
curl -X POST "http://localhost:3002/api/reserve-stock" \
  -H "Content-Type: application/json" \
  -d '{"operations":[{"productId":"halloween-tee","quantity":1,"size":"M"}],"sessionId":"test-session","expirationMinutes":30}'

# Release stock
curl -X POST "http://localhost:3002/api/release-stock" \
  -H "Content-Type: application/json" \
  -d '{"operations":[{"productId":"halloween-tee","quantity":1,"size":"M"}]}'
```

### 8. Performance Tests

#### Test 8.1: Loading Speed
**Goal**: Ensure stock calculations don't slow page load
**Steps**:
1. Measure product page load time
2. Add items to cart and measure update speed
3. Verify responsive user interface

#### Test 8.2: Memory Usage
**Goal**: Check for memory leaks in stock calculations
**Steps**:
1. Add/remove items repeatedly
2. Monitor browser memory usage
3. Verify no significant memory growth

## Test Results Template

### Test 1.1 Results: Publication Stock Display
- [ ] Initial stock display correct
- [ ] Stock decreases with cart additions
- [ ] Real-time updates work
- [ ] SOLD OUT state functions
- [ ] Button disabled when out of stock
- **Issues Found**: 
- **Status**: ✅ PASS / ❌ FAIL

### Test 1.2 Results: Apparel Variant Stock Display
- [ ] Size-specific stock displays
- [ ] Independent size stock tracking
- [ ] Size selector updates correctly
- [ ] Out-of-stock sizes disabled
- **Issues Found**: 
- **Status**: ✅ PASS / ❌ FAIL

[Continue for all tests...]

## Critical Issues to Watch For

1. **Stock Inconsistency**: Different components showing different stock counts
2. **Race Conditions**: Multiple users able to exceed stock
3. **UI Freezing**: Components not updating after cart changes
4. **Memory Leaks**: Performance degradation over time
5. **API Failures**: Graceful error handling
6. **Cart Persistence**: Stock validation after page refresh
7. **Checkout Failures**: Stock changes blocking legitimate purchases

## Success Criteria

- ✅ Real-time stock updates across all components
- ✅ No overselling under any circumstances
- ✅ Clear user feedback for all stock states
- ✅ Graceful error handling
- ✅ Consistent stock display everywhere
- ✅ Performance remains responsive
- ✅ Edge cases handled properly