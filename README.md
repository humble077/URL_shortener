# HYPd URL Shortener

A simple and efficient URL shortener API built with Node.js and PostgreSQL. This service allows you to shorten long URLs into compact, shareable links while tracking click statistics and analytics.

## Features

- **URL Shortening**: Convert long URLs into short, memorable links
- **Domain Restricted**: Only supports hypd.store domain and its subdomains
- **Product Information**: Automatically extracts and stores product details for product URLs
- **Enhanced Analytics**: Track click counts, first click, last click, and access timestamps
- **Modern Frontend**: Beautiful SaaS-style web interface with responsive design
- **Security**: Rate limiting, input validation, and CORS protection
- **Docker Support**: Easy PostgreSQL setup with Docker Compose
- **RESTful API**: Clean and simple API design
- **Fast**: Optimized database queries with proper indexing

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd hypd_url_shortener
npm install
```

### 2. Set up Environment Variables

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=url_shortener
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This will start a PostgreSQL database container with the following default settings:
- Database: `url_shortener`
- User: `postgres`
- Password: `password`
- Port: `5432`

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will automatically:
- Create the database if it doesn't exist
- Set up the required tables and indexes
- Handle schema updates gracefully
- Start listening on the configured port
- Serve the modern web frontend at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### POST /api/shorten
Create a shortened URL.

**Request:**
```json
{
  "url": "https://api.hypd.store/very/long/url/path"
}
```

**Response (Regular URL):**
```json
{
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://api.hypd.store/very/long/url/path",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (Product URL):**
```json
{
  "shortCode": "def456",
  "shortUrl": "http://localhost:3000/def456",
  "originalUrl": "https://www.hypd.store/hypd_store/product/6888713305e32ec275591e09?title=Product+Name",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "productInfo": {
    "productId": "6888713305e32ec275591e09",
    "productName": "Facebath Deep Cleansing Facewash 50ml - Pack of 1",
    "productPrice": "224.00",
    "brandName": "Personal Touch",
    "productImageUrl": "https://cdn.hypd.store/assets/img/59e11758181263432liccnjxp7m7.png"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid URL format, missing URL, or non-hypd.store domain
- `500 Internal Server Error`: Server error

#### GET /:shortCode
Redirect to the original URL and track analytics.

**Response:** 
- `302 Found`: Redirects to the original URL
- `404 Not Found`: Short code doesn't exist

#### GET /api/stats/:shortCode
Get analytics for a shortened URL.

**Response (Regular URL):**
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://api.hypd.store/very/long/url/path",
  "clickCount": 42,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastAccessed": "2024-01-15T10:30:00.000Z",
  "firstClick": "2024-01-01T12:00:00.000Z",
  "lastClick": "2024-01-15T10:30:00.000Z"
}
```

**Response (Product URL):**
```json
{
  "shortCode": "def456",
  "originalUrl": "https://www.hypd.store/hypd_store/product/6888713305e32ec275591e09?title=Product+Name",
  "clickCount": 15,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastAccessed": "2024-01-15T10:30:00.000Z",
  "firstClick": "2024-01-01T12:00:00.000Z",
  "lastClick": "2024-01-15T10:30:00.000Z",
  "productInfo": {
    "productId": "6888713305e32ec275591e09",
    "productName": "Facebath Deep Cleansing Facewash 50ml - Pack of 1",
    "productPrice": "224.00",
    "brandName": "Personal Touch",
    "productImageUrl": "https://cdn.hypd.store/assets/img/59e11758181263432liccnjxp7m7.png"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid short code format
- `404 Not Found`: Short code doesn't exist
- `500 Internal Server Error`: Server error

## Database Schema

```sql
CREATE TABLE urls (
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

-- Indexes for performance
CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_created_at ON urls(created_at);
CREATE INDEX idx_product_id ON urls(product_id);
CREATE INDEX idx_is_product_url ON urls(is_product_url);
CREATE INDEX idx_first_click ON urls(first_click);
CREATE INDEX idx_last_click ON urls(last_click);
```

## Testing

Run the test suite to verify everything is working:

```bash
npm test
```

The test script will:
1. Create a short URL
2. Retrieve statistics
3. Test URL redirection
4. Validate error handling

For product functionality testing:
```bash
npm run test:product
```

For analytics testing:
```bash
npm run test:analytics
```

You can also test manually using curl:

```bash
# Create a short URL (must be hypd.store domain)
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.hypd.store/example"}'

# Get stats
curl http://localhost:3000/api/stats/abc123

# Visit short URL (will redirect)
curl -I http://localhost:3000/abc123

# Test domain restriction (will fail)
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `url_shortener` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `PORT` | Server port | `3000` |
| `BASE_URL` | Base URL for short links | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

### Rate Limiting

The API includes rate limiting to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: Applied to all `/api/*` endpoints
- **Response**: `429 Too Many Requests` when limit exceeded

## Security Features

- **Domain Restriction**: Only hypd.store domain and subdomains are allowed
- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: URL format validation
- **SQL Injection Protection**: Parameterized queries

## Domain Restriction

The URL shortener is restricted to only work with URLs from the `hypd.store` domain and its subdomains. This includes:

- `https://hypd.store/...`
- `http://hypd.store/...`
- `https://api.hypd.store/...`
- `https://www.hypd.store/...`
- `https://any-subdomain.hypd.store/...`

Any attempt to shorten a URL from a different domain will result in a `400 Bad Request` error with the message: `"Only hypd.store is supported"`

## Product Information Extraction

The URL shortener automatically detects and extracts product information from hypd.store product URLs:

### **Supported Product URL Format:**
```
https://www.hypd.store/hypd_store/product/{product_id}?title=Product+Name
```

### **Extracted Information:**
- **Product ID**: Unique identifier from the URL
- **Product Name**: Retrieved from catalog API
- **Product Price**: Retail price in INR
- **Brand Name**: Product brand information
- **Product Image**: Featured product image URL

### **How It Works:**
1. **URL Analysis**: Detects product URLs by pattern matching
2. **API Integration**: Fetches product details from `catalog2.hypd.store`
3. **Data Storage**: Stores product metadata in database
4. **API Response**: Includes product information in API responses

### **Example Product URL:**
```
Input:  https://www.hypd.store/hypd_store/product/6888713305e32ec275591e09?title=Facebath+Deep+Cleansing+Facewash+50ml+-+Pack+of+1

Output: {
  "shortCode": "abc123",
  "productInfo": {
    "productId": "6888713305e32ec275591e09",
    "productName": "Facebath Deep Cleansing Facewash 50ml - Pack of 1",
    "productPrice": "224.00",
    "brandName": "Personal Touch",
    "productImageUrl": "https://cdn.hypd.store/assets/img/59e11758181263432liccnjxp7m7.png"
  }
}
```

## Enhanced Analytics

The URL shortener provides comprehensive analytics for each shortened URL:

### **Analytics Fields:**
- **clickCount**: Total number of clicks
- **createdAt**: When the short URL was created
- **lastAccessed**: Last time the URL was accessed (legacy field)
- **firstClick**: Timestamp of the very first click
- **lastClick**: Timestamp of the most recent click

### **Analytics Logic:**
1. **First Click**: Set only once when the URL is first accessed
2. **Last Click**: Updated with every click
3. **Click Count**: Increments with each access
4. **Time Tracking**: Precise timestamps for all events

### **Example Analytics:**
```json
{
  "shortCode": "abc123",
  "clickCount": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "firstClick": "2024-01-01T12:00:00.000Z",
  "lastClick": "2024-01-01T12:05:00.000Z"
}
```

This shows:
- URL created at midnight
- First click at noon
- Last click 5 minutes later
- Total of 3 clicks

## Modern Web Frontend

The URL shortener includes a beautiful, modern web interface with the following features:

### **Frontend Features:**
- **Modern SaaS Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time URL Shortening**: Instant URL shortening with loading states
- **Copy to Clipboard**: One-click copy functionality with visual feedback
- **Product Information Display**: Shows product details and images for product URLs
- **Interactive Elements**: Smooth animations and hover effects
- **Toast Notifications**: User-friendly success and error messages
- **Analytics Dashboard**: Visual representation of URL statistics

### **User Experience:**
1. **Enter URL**: Users paste their hypd.store URL in the input field
2. **Shorten**: Click the "Shorten" button to create a short link
3. **View Result**: The form updates to show the shortened URL
4. **Copy Link**: Click the copy button to copy the URL to clipboard
5. **Product Info**: For product URLs, see product details and image below

### **Frontend Technologies:**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks, pure JavaScript for optimal performance
- **Font Awesome**: Professional icons throughout the interface
- **Google Fonts**: Inter font family for modern typography

### **Access the Frontend:**
Simply visit `http://localhost:3000` after starting the server to access the web interface.

## Deployment

### Production Considerations

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Use a managed PostgreSQL service
3. **Process Manager**: Use PM2 or similar
4. **Reverse Proxy**: Use Nginx or Apache
5. **SSL**: Enable HTTPS for production

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure PostgreSQL is running: `docker-compose ps`
- Check environment variables in `.env`
- Verify database credentials

**Port Already in Use:**
- Change the `PORT` in `.env`
- Kill existing processes: `lsof -ti:3000 | xargs kill`

**Short Code Collision:**
- The system automatically retries up to 5 times
- If still failing, check database constraints

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure Docker containers are running
4. Run the test suite to verify functionality
