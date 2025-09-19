const axios = require('axios');

function extractProductId(url) {
  try {
    const urlObj = new URL(url);
    
    if (!urlObj.hostname.includes('hypd.store')) {
      return null;
    }
    
    const pathMatch = urlObj.pathname.match(/\/hypd_store\/product\/([a-f0-9]+)/);
    
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting product ID:', error);
    return null;
  }
}

async function fetchProductInfo(productId) {
  try {
    const catalogUrl = `https://catalog2.hypd.store/api/app/catalog/basic?id=${productId}.json&id=${productId}`;
    
    const response = await axios.get(catalogUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'HYPd-URL-Shortener/1.0'
      }
    });
    
    if (response.data && response.data.success && response.data.payload && response.data.payload.length > 0) {
      const product = response.data.payload[0];
      
      return {
        productId: product.id,
        productName: product.name,
        productPrice: product.retail_price?.value || product.base_price?.value || 0,
        brandName: product.brand_info?.name || 'Unknown Brand',
        productImageUrl: product.featured_image?.src || null,
        isProductUrl: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product info:', error);
    return null;
  }
}

async function parseProductInfo(url) {
  try {
    const productId = extractProductId(url);
    
    if (!productId) {
      return {
        isProductUrl: false,
        productId: null,
        productName: null,
        productPrice: null,
        brandName: null,
        productImageUrl: null
      };
    }
    
    const productInfo = await fetchProductInfo(productId);
    
    if (productInfo) {
      return productInfo;
    }
    
    return {
      isProductUrl: true,
      productId: productId,
      productName: null,
      productPrice: null,
      brandName: null,
      productImageUrl: null
    };
  } catch (error) {
    console.error('Error parsing product info:', error);
    return {
      isProductUrl: false,
      productId: null,
      productName: null,
      productPrice: null,
      brandName: null,
      productImageUrl: null
    };
  }
}

module.exports = {
  extractProductId,
  fetchProductInfo,
  parseProductInfo
};