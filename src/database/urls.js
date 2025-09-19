const { pool } = require('./connection');
const { generateShortCode } = require('../utils/shortCode');
const { parseProductInfo } = require('../utils/productParser');

async function createShortUrl(originalUrl) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const productInfo = await parseProductInfo(originalUrl);
    
    let shortCode;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
      shortCode = generateShortCode();
      const existing = await client.query(
        'SELECT id FROM urls WHERE short_code = $1',
        [shortCode]
      );
      
      if (existing.rows.length === 0) {
        break;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique short code');
    }
    
    const result = await client.query(`
      INSERT INTO urls (
        short_code, 
        original_url, 
        product_id, 
        product_name, 
        product_price, 
        brand_name, 
        product_image_url, 
        is_product_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [
      shortCode, 
      originalUrl,
      productInfo.productId,
      productInfo.productName,
      productInfo.productPrice,
      productInfo.brandName,
      productInfo.productImageUrl,
      productInfo.isProductUrl
    ]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getUrlByShortCode(shortCode) {
  const result = await pool.query(
    'SELECT * FROM urls WHERE short_code = $1',
    [shortCode]
  );
  
  return result.rows[0] || null;
}

async function incrementClickCount(shortCode) {
  await pool.query(`
    UPDATE urls 
    SET 
      click_count = click_count + 1, 
      last_accessed = CURRENT_TIMESTAMP,
      first_click = CASE 
        WHEN first_click IS NULL THEN CURRENT_TIMESTAMP 
        ELSE first_click 
      END,
      last_click = CURRENT_TIMESTAMP
    WHERE short_code = $1
  `, [shortCode]);
}

async function getUrlStats(shortCode) {
  const result = await pool.query(`
    SELECT 
      short_code, 
      original_url, 
      click_count, 
      created_at, 
      last_accessed,
      first_click,
      last_click,
      product_id,
      product_name,
      product_price,
      brand_name,
      product_image_url,
      is_product_url
    FROM urls 
    WHERE short_code = $1
  `, [shortCode]);
  
  return result.rows[0] || null;
}

module.exports = {
  createShortUrl,
  getUrlByShortCode,
  incrementClickCount,
  getUrlStats
};