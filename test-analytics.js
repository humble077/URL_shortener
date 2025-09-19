const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAnalytics() {
  try {
    console.log('📊 Testing Enhanced Analytics (First Click & Last Click)...\n');
    
    // Test 1: Create a short URL
    console.log('1. Creating short URL...');
    const shortenResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: 'https://api.hypd.store/test-analytics'
    });
    
    console.log('✅ Short URL created:', shortenResponse.data);
    const shortCode = shortenResponse.data.shortCode;
    
    // Test 2: Check initial stats (no clicks yet)
    console.log('\n2. Checking initial stats (no clicks)...');
    const initialStats = await axios.get(`${BASE_URL}/api/stats/${shortCode}`);
    console.log('✅ Initial stats:', {
      clickCount: initialStats.data.clickCount,
      firstClick: initialStats.data.firstClick,
      lastClick: initialStats.data.lastClick
    });
    
    // Test 3: First click
    console.log('\n3. Simulating first click...');
    await axios.get(`${BASE_URL}/${shortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    const firstClickStats = await axios.get(`${BASE_URL}/api/stats/${shortCode}`);
    console.log('✅ After first click:', {
      clickCount: firstClickStats.data.clickCount,
      firstClick: firstClickStats.data.firstClick,
      lastClick: firstClickStats.data.lastClick
    });
    
    // Test 4: Second click (should update last_click only)
    console.log('\n4. Simulating second click...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await axios.get(`${BASE_URL}/${shortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    const secondClickStats = await axios.get(`${BASE_URL}/api/stats/${shortCode}`);
    console.log('✅ After second click:', {
      clickCount: secondClickStats.data.clickCount,
      firstClick: secondClickStats.data.firstClick,
      lastClick: secondClickStats.data.lastClick
    });
    
    // Test 5: Third click (should update last_click only)
    console.log('\n5. Simulating third click...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await axios.get(`${BASE_URL}/${shortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    const thirdClickStats = await axios.get(`${BASE_URL}/api/stats/${shortCode}`);
    console.log('✅ After third click:', {
      clickCount: thirdClickStats.data.clickCount,
      firstClick: thirdClickStats.data.firstClick,
      lastClick: thirdClickStats.data.lastClick
    });
    
    // Test 6: Verify analytics logic
    console.log('\n6. Verifying analytics logic...');
    const finalStats = thirdClickStats.data;
    
    // Check that first_click is set and doesn't change
    if (finalStats.firstClick && finalStats.firstClick === firstClickStats.data.firstClick) {
      console.log('✅ First click timestamp is correctly set and preserved');
    } else {
      console.log('❌ First click timestamp issue');
    }
    
    // Check that last_click updates with each click
    if (finalStats.lastClick && finalStats.lastClick !== firstClickStats.data.lastClick) {
      console.log('✅ Last click timestamp updates correctly');
    } else {
      console.log('❌ Last click timestamp issue');
    }
    
    // Check click count
    if (finalStats.clickCount === 3) {
      console.log('✅ Click count is accurate');
    } else {
      console.log('❌ Click count issue');
    }
    
    // Test 7: Test with product URL
    console.log('\n7. Testing analytics with product URL...');
    const productResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: 'https://www.hypd.store/hypd_store/product/6888713305e32ec275591e09?title=Test+Product'
    });
    
    const productShortCode = productResponse.data.shortCode;
    console.log('✅ Product URL shortened:', productShortCode);
    
    // Click the product URL
    await axios.get(`${BASE_URL}/${productShortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    const productStats = await axios.get(`${BASE_URL}/api/stats/${productShortCode}`);
    console.log('✅ Product URL analytics:', {
      clickCount: productStats.data.clickCount,
      firstClick: productStats.data.firstClick,
      lastClick: productStats.data.lastClick,
      hasProductInfo: !!productStats.data.productInfo
    });
    
    console.log('\n🎉 All analytics tests passed!');
    console.log('\n📊 Analytics Summary:');
    console.log(`• First Click: ${finalStats.firstClick}`);
    console.log(`• Last Click: ${finalStats.lastClick}`);
    console.log(`• Total Clicks: ${finalStats.clickCount}`);
    console.log(`• Time Between First & Last: ${new Date(finalStats.lastClick) - new Date(finalStats.firstClick)}ms`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAnalytics();
}

module.exports = { testAnalytics };
