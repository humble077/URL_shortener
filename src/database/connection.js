const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'url_shortener',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

async function initializeDatabase() {
  try {
    const adminPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    const dbName = process.env.DB_NAME || 'url_shortener';
    
    const result = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
    }

    await adminPool.end();

    await createTables();
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  const createUrlsTable = `
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(10) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      click_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_accessed TIMESTAMP,
      first_click TIMESTAMP,
      last_click TIMESTAMP,
      product_id VARCHAR(50),
      product_name TEXT,
      product_price DECIMAL(10,2),
      brand_name VARCHAR(255),
      product_image_url TEXT,
      is_product_url BOOLEAN DEFAULT FALSE
    );
  `;

  await pool.query(createUrlsTable);

  const alterTableQueries = [
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS product_id VARCHAR(50)',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS product_name TEXT',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS product_price DECIMAL(10,2)',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255)',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS product_image_url TEXT',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS is_product_url BOOLEAN DEFAULT FALSE',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS first_click TIMESTAMP',
    'ALTER TABLE urls ADD COLUMN IF NOT EXISTS last_click TIMESTAMP'
  ];

  for (const query of alterTableQueries) {
    try {
      await pool.query(query);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.warn('Warning:', error.message);
      }
    }
  }

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
    CREATE INDEX IF NOT EXISTS idx_created_at ON urls(created_at);
    CREATE INDEX IF NOT EXISTS idx_product_id ON urls(product_id);
    CREATE INDEX IF NOT EXISTS idx_is_product_url ON urls(is_product_url);
    CREATE INDEX IF NOT EXISTS idx_first_click ON urls(first_click);
    CREATE INDEX IF NOT EXISTS idx_last_click ON urls(last_click);
  `;

  await pool.query(createIndexes);
}

module.exports = {
  pool,
  initializeDatabase
};