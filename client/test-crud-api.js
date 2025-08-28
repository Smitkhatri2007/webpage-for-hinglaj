// Simple test script to verify the edit and delete API endpoints
// Run with: node test-crud-api.js

console.log('Testing CRUD API endpoints...\n');

// Test GET single item endpoint
async function testGetItem() {
  console.log('1. Testing GET /api/items/:id');
  try {
    const response = await fetch('http://localhost:4000/api/items/2');
    if (response.ok) {
      const item = await response.json();
      console.log('✅ GET single item successful');
      console.log('Item:', JSON.stringify(item, null, 2));
      return item;
    } else {
      console.log('❌ GET single item failed:', response.status);
    }
  } catch (error) {
    console.log('❌ GET single item error:', error.message);
  }
  return null;
}

// Test PUT update endpoint
async function testUpdateItem(itemId) {
  console.log('\n2. Testing PUT /api/items/:id');
  
  const testData = {
    name: "Updated Samosa",
    description: "Hot and spicy updated",
    category: "Namkeens & Snacks",
    baseQuantity: "60",
    quantityUnit: "pcs",
    variants: JSON.stringify([
      { size: "Single Piece", price: 20, available: true },
      { size: "Pack of 5", price: 90, available: true }
    ])
  };

  try {
    // Create FormData
    const formData = new FormData();
    Object.keys(testData).forEach(key => {
      formData.append(key, testData[key]);
    });

    // Note: This test would need admin authentication in real use
    // For testing without auth, you'd need to modify the API temporarily
    const response = await fetch(`http://localhost:4000/api/items/${itemId}`, {
      method: 'PUT',
      body: formData
      // headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ PUT update successful');
      console.log('Updated item:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ PUT update failed:', response.status, error);
      
      // If auth error, explain
      if (response.status === 401 || response.status === 403) {
        console.log('(This is expected without admin authentication)');
      }
    }
  } catch (error) {
    console.log('❌ PUT update error:', error.message);
  }
}

// Test DELETE endpoint
async function testDeleteItem(itemId) {
  console.log('\n3. Testing DELETE /api/items/:id');
  
  try {
    // Note: This test would need admin authentication in real use
    const response = await fetch(`http://localhost:4000/api/items/${itemId}`, {
      method: 'DELETE'
      // headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ DELETE successful');
      console.log('Result:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ DELETE failed:', response.status, error);
      
      // If auth error, explain
      if (response.status === 401 || response.status === 403) {
        console.log('(This is expected without admin authentication)');
      }
    }
  } catch (error) {
    console.log('❌ DELETE error:', error.message);
  }
}

// Run tests
async function runTests() {
  const item = await testGetItem();
  
  if (item) {
    await testUpdateItem(item.id);
    // Note: Uncomment next line only if you want to actually delete the item
    // await testDeleteItem(item.id);
    console.log('\n⚠️  DELETE test skipped to preserve data');
  }
  
  console.log('\n📝 Note: PUT and DELETE tests may fail due to authentication requirements.');
  console.log('   In the real admin UI, these would work with proper admin login.');
}

runTests().catch(console.error);
