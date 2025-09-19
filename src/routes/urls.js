const express = require('express');
const validator = require('validator');
const { createShortUrl, getUrlStats } = require('../database/urls');
const axios = require('axios');

const router = express.Router();

router.post('/shorten', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    })) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (!hostname.endsWith('.hypd.store') && hostname !== 'hypd.store') {
      return res.status(400).json({ 
        error: 'Only hypd.store is supported' 
      });
    }
    
    const urlData = await createShortUrl(url);
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const shortUrl = `${baseUrl}/${urlData.short_code}`;
    
    const response = {
      shortCode: urlData.short_code,
      shortUrl: shortUrl,
      originalUrl: urlData.original_url,
      createdAt: urlData.created_at
    };

    if (urlData.is_product_url) {
      response.productInfo = {
        productId: urlData.product_id,
        productName: urlData.product_name,
        productPrice: urlData.product_price,
        brandName: urlData.brand_name,
        productImageUrl: urlData.product_image_url
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});

router.get('/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    if (!shortCode || shortCode.length < 3) {
      return res.status(400).json({ error: 'Invalid short code' });
    }
    
    const stats = await getUrlStats(shortCode);
    
    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    const response = {
      shortCode: stats.short_code,
      originalUrl: stats.original_url,
      clickCount: stats.click_count,
      createdAt: stats.created_at,
      lastAccessed: stats.last_accessed,
      firstClick: stats.first_click,
      lastClick: stats.last_click
    };

    if (stats.is_product_url) {
      response.productInfo = {
        productId: stats.product_id,
        productName: stats.product_name,
        productPrice: stats.product_price,
        brandName: stats.brand_name,
        productImageUrl: stats.product_image_url
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/image-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    })) {
      return res.status(400).json({ error: 'Invalid image URL format' });
    }
    
    console.log('Proxying image URL:', url);
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Error proxying image:', error.message);
    console.error('Image URL that failed:', url);
    
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ error: 'Image not found' });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Image request timeout' });
    } else if (error.response && error.response.status) {
      return res.status(error.response.status).json({ error: 'Failed to fetch image from source' });
    } else {
      return res.status(500).json({ error: 'Failed to load image' });
    }
  }
});

module.exports = router;