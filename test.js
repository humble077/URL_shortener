const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('Testing URL Shortener API...\n');
    
    // Test 1: Create a short URL
    console.log('1. Creating short URL...');
    const shortenResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: 'https://api.hypd.store/test'
    });
    
    console.log('✅ Short URL created:', shortenResponse.data);
    const shortCode = shortenResponse.data.shortCode;
    
    // Test 2: Get stats
    console.log('\n2. Getting stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/stats/${shortCode}`);
    console.log('✅ Stats retrieved:', statsResponse.data);
    
    // Test 3: Test redirect (just check if it returns 302)
    console.log('\n3. Testing redirect...');
    const redirectResponse = await axios.get(`${BASE_URL}/${shortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    console.log('✅ Redirect working, status:', redirectResponse.status);
    
    // Test 4: Test invalid URL
    console.log('\n4. Testing invalid URL...');
    try {
      await axios.post(`${BASE_URL}/api/shorten`, {
        url: 'not-a-valid-url'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid URL properly rejected');
      } else {
        throw error;
      }
    }
    
    // Test 5: Test non-hypd.store domain
    console.log('\n5. Testing non-hypd.store domain...');
    try {
      await axios.post(`${BASE_URL}/api/shorten`, {
        url: 'https://google.com'
      });
    } catch (error) {
      if (error.response && error.response.status === 400 && 
          error.response.data.error === 'Only hypd.store is supported') {
        console.log('✅ Non-hypd.store domain properly rejected');
      } else {
        throw error;
      }
    }
    
    // Test 6: Test hypd.store subdomain
    console.log('\n6. Testing hypd.store subdomain...');
    const subdomainResponse = await axios.post(`${BASE_URL}/api/shorten`, {
      url: 'https://api.hypd.store/test'
    });
    console.log('✅ hypd.store subdomain accepted:', subdomainResponse.data.shortCode);
    
    // Test 7: Test non-existent short code
    console.log('\n7. Testing non-existent short code...');
    try {
      await axios.get(`${BASE_URL}/api/stats/nonexistent`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Non-existent short code properly handled');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
