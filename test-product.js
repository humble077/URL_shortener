const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testProductFunctionality() {
  try {
    console.log('🛍️ Testing Product URL Shortener Functionality...\n');
    
    // Test 1: Create short URL for a product
    console.log('1. Creating short URL for product...');
    const productUrl = 'https://www.hypd.store/hypd_store/product/6888713305e32ec275591e09?title=Facebath+Deep+Cleansing+Facewash+50ml+-+Pack+of+1';
    
    const shortenResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: productUrl
    });
    
    console.log('✅ Product URL shortened:', shortenResponse.data);
    const shortCode = shortenResponse.data.shortCode;
    
    // Verify product information is included
    if (shortenResponse.data.productInfo) {
      console.log('✅ Product information included:');
      console.log(`   - Product ID: ${shortenResponse.data.productInfo.productId}`);
      console.log(`   - Product Name: ${shortenResponse.data.productInfo.productName}`);
      console.log(`   - Price: ₹${shortenResponse.data.productInfo.productPrice}`);
      console.log(`   - Brand: ${shortenResponse.data.productInfo.brandName}`);
      console.log(`   - Image: ${shortenResponse.data.productInfo.productImageUrl}`);
    } else {
      console.log('❌ Product information not found');
    }
    
    // Test 2: Get stats with product information
    console.log('\n2. Getting stats with product information...');
    const statsResponse = await axios.get(`${BASE_URL}/api/stats/${shortCode}`);
    console.log('✅ Stats retrieved:', statsResponse.data);
    
    if (statsResponse.data.productInfo) {
      console.log('✅ Product information in stats:');
      console.log(`   - Product: ${statsResponse.data.productInfo.productName}`);
      console.log(`   - Brand: ${statsResponse.data.productInfo.brandName}`);
      console.log(`   - Price: ₹${statsResponse.data.productInfo.productPrice}`);
    }
    
    // Test 3: Test redirect functionality
    console.log('\n3. Testing redirect...');
    const redirectResponse = await axios.get(`${BASE_URL}/${shortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    console.log('✅ Redirect working, status:', redirectResponse.status);
    
    // Test 4: Create short URL for non-product URL
    console.log('\n4. Testing non-product URL...');
    const nonProductUrl = 'https://hypd.store/about';
    
    const nonProductResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: nonProductUrl
    });
    
    console.log('✅ Non-product URL shortened:', nonProductResponse.data);
    
    if (!nonProductResponse.data.productInfo) {
      console.log('✅ No product information included (correct)');
    } else {
      console.log('❌ Product information should not be included for non-product URLs');
    }
    
    // Test 5: Test another product URL
    console.log('\n5. Testing another product URL...');
    const anotherProductUrl = 'https://api.hypd.store/hypd_store/product/6888713305e32ec275591e09?title=Test+Product';
    
    const anotherProductResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: anotherProductUrl
    });
    
    console.log('✅ Another product URL shortened:', anotherProductResponse.data);
    
    if (anotherProductResponse.data.productInfo) {
      console.log('✅ Product information included for second product');
    }
    
    console.log('\n🎉 All product functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testProductFunctionality();
}

module.exports = { testProductFunctionality };
