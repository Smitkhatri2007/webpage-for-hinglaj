// Simple test script to verify the API endpoint
// Run with: node test-api.js

const testData = {
  name: "Test Product",
  description: "Test description",
  category: "Traditional Sweets", 
  baseQuantity: "10",
  quantityUnit: "kg",
  variants: JSON.stringify([
    { size: "250g", price: 100, available: true }
  ])
};

// You'll need to replace 'YOUR_ADMIN_TOKEN' with an actual admin JWT token
const adminToken = "YOUR_ADMIN_TOKEN";

const formData = new FormData();
Object.keys(testData).forEach(key => {
  formData.append(key, testData[key]);
});

fetch('http://localhost:4000/api/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch(error => {
  console.error('Error:', error);
});
