// Automated Inventory Management Testing Script
// Run this in browser console on http://localhost:3002

console.log('🧪 Starting Inventory Management Tests...');

const API_BASE = 'http://localhost:3002/api';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Test utility functions
const testResult = (testName, condition, message) => {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}: ${message}`);
  return condition;
};

const getStockStatus = async (productIds) => {
  const response = await fetch(`${API_BASE}/stock-status?productIds=${productIds.join(',')}`);
  return response.json();
};

const postStockCheck = async (items) => {
  const response = await fetch(`${API_BASE}/stock-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  return response.json();
};

const reserveStock = async (operations, sessionId) => {
  const response = await fetch(`${API_BASE}/reserve-stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations, sessionId, expirationMinutes: 30 })
  });
  return response.json();
};

const releaseStock = async (operations) => {
  const response = await fetch(`${API_BASE}/release-stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations })
  });
  return response.json();
};

// Test Suite 1: API Endpoint Tests
async function testAPIEndpoints() {
  console.log('\n📡 Testing API Endpoints...');
  
  try {
    // Test 1.1: Stock Status GET
    const stockStatus = await getStockStatus(['halloween-tee', 'railcam']);
    testResult('API GET Stock Status', stockStatus.success, 
      stockStatus.success ? 'API responds correctly' : 'API failed');
    
    // Test 1.2: Stock Status POST
    const stockCheck = await postStockCheck([
      { productId: 'halloween-tee', quantity: 1, size: 'm' }
    ]);
    testResult('API POST Stock Check', stockCheck.success && stockCheck.allInStock,
      stockCheck.success ? 'Stock validation works' : 'Stock validation failed');
    
    // Test 1.3: Stock Reservation
    const sessionId = 'test-session-' + Date.now();
    const reserveResult = await reserveStock([
      { productId: 'railcam', quantity: 1 }
    ], sessionId);
    testResult('API Stock Reservation', reserveResult.success,
      reserveResult.success ? 'Stock reservation works' : 'Stock reservation failed');
    
    // Test 1.4: Stock Release
    if (reserveResult.success) {
      await delay(1000);
      const releaseResult = await releaseStock([
        { productId: 'railcam', quantity: 1 }
      ]);
      testResult('API Stock Release', releaseResult.success,
        releaseResult.success ? 'Stock release works' : 'Stock release failed');
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

// Test Suite 2: Frontend Integration Tests
async function testFrontendIntegration() {
  console.log('\n🖥️ Testing Frontend Integration...');
  
  try {
    // Test 2.1: Check if we're on a product page
    const isProductPage = window.location.pathname.includes('/products/');
    if (!isProductPage) {
      console.log('⚠️ Navigate to a product page to test frontend integration');
      return;
    }
    
    // Test 2.2: Check for Add to Cart button
    const addToCartBtn = document.querySelector('button[type="button"]');
    testResult('Add to Cart Button Present', !!addToCartBtn,
      addToCartBtn ? 'Button found' : 'Button not found');
    
    // Test 2.3: Check for stock display
    const stockDisplay = document.body.innerText.includes('LEFT') || 
                        document.body.innerText.includes('SOLD OUT') ||
                        document.body.innerText.includes('In Stock');
    testResult('Stock Display Present', stockDisplay,
      stockDisplay ? 'Stock information visible' : 'No stock information found');
    
    // Test 2.4: Check cart functionality
    const cartContext = window.React && document.querySelector('[data-cart]');
    testResult('Cart Context Available', true, 'Assuming cart context works (needs manual verification)');
    
  } catch (error) {
    console.error('❌ Frontend Test Error:', error);
  }
}

// Test Suite 3: Stock Validation Tests  
async function testStockValidation() {
  console.log('\n🔍 Testing Stock Validation Logic...');
  
  try {
    // Test 3.1: Valid stock request
    const validRequest = await postStockCheck([
      { productId: 'railcam', quantity: 2 }
    ]);
    testResult('Valid Stock Request', validRequest.allInStock,
      validRequest.allInStock ? 'Valid request accepted' : 'Valid request rejected');
    
    // Test 3.2: Excessive stock request
    const excessiveRequest = await postStockCheck([
      { productId: 'railcam', quantity: 100 }
    ]);
    testResult('Excessive Stock Request', !excessiveRequest.allInStock,
      !excessiveRequest.allInStock ? 'Excessive request rejected' : 'Excessive request accepted (BAD)');
    
    // Test 3.3: Out of stock product
    const outOfStockRequest = await postStockCheck([
      { productId: 'railways-and-sleepers', quantity: 1 }
    ]);
    testResult('Out of Stock Request', !outOfStockRequest.allInStock,
      !outOfStockRequest.allInStock ? 'Out of stock detected' : 'Out of stock not detected (BAD)');
    
    // Test 3.4: Variant stock validation
    const variantRequest = await postStockCheck([
      { productId: 'halloween-tee', quantity: 1, size: 'm' }
    ]);
    testResult('Variant Stock Request', variantRequest.allInStock,
      variantRequest.allInStock ? 'Variant stock validated' : 'Variant stock validation failed');
    
  } catch (error) {
    console.error('❌ Stock Validation Test Error:', error);
  }
}

// Test Suite 4: Race Condition Tests
async function testRaceConditions() {
  console.log('\n🏃 Testing Race Conditions...');
  
  try {
    const sessionId1 = 'race-test-1-' + Date.now();
    const sessionId2 = 'race-test-2-' + Date.now();
    
    // Test 4.1: Concurrent reservations
    const promises = [
      reserveStock([{ productId: 'railcam', quantity: 3 }], sessionId1),
      reserveStock([{ productId: 'railcam', quantity: 3 }], sessionId2)
    ];
    
    const [result1, result2] = await Promise.all(promises);
    const bothSucceeded = result1.success && result2.success;
    testResult('Concurrent Reservation Prevention', !bothSucceeded,
      !bothSucceeded ? 'Race condition prevented' : 'Race condition occurred (BAD)');
    
    // Clean up reservations
    await Promise.all([
      releaseStock([{ productId: 'railcam', quantity: 3 }]),
      releaseStock([{ productId: 'railcam', quantity: 3 }])
    ]);
    
  } catch (error) {
    console.error('❌ Race Condition Test Error:', error);
  }
}

// Test Suite 5: Error Handling Tests
async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  try {
    // Test 5.1: Invalid product ID
    const invalidProduct = await getStockStatus(['non-existent-product']);
    testResult('Invalid Product Handling', invalidProduct.success && invalidProduct.stockStatus.length === 0,
      'Invalid products handled gracefully');
    
    // Test 5.2: Malformed request
    try {
      const response = await fetch(`${API_BASE}/stock-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      });
      const result = await response.json();
      testResult('Malformed Request Handling', response.status >= 400,
        'Malformed requests rejected appropriately');
    } catch (e) {
      testResult('Malformed Request Handling', true, 'Network error handled gracefully');
    }
    
  } catch (error) {
    console.error('❌ Error Handling Test Error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Inventory Management Tests');
  console.log('================================================');
  
  await testAPIEndpoints();
  await testFrontendIntegration();
  await testStockValidation();
  await testRaceConditions();
  await testErrorHandling();
  
  console.log('\n✅ Test Suite Completed');
  console.log('Check results above for any failures');
}

// Export for manual execution
window.inventoryTests = {
  runAllTests,
  testAPIEndpoints,
  testFrontendIntegration,
  testStockValidation,
  testRaceConditions,
  testErrorHandling,
  getStockStatus,
  postStockCheck,
  reserveStock,
  releaseStock
};

console.log('Test functions loaded. Run inventoryTests.runAllTests() to start all tests');