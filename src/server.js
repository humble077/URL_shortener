const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const urlRoutes = require('./routes/urls');
const { initializeDatabase } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/api', urlRoutes);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/stats', (req, res) => {
  res.sendFile('stats.html', { root: 'public' });
});

app.get('/urlstat/:shortCode', (req, res) => {
  res.sendFile('stats.html', { root: 'public' });
});

app.get('/:shortCode', async (req, res) => {
  try {
    const { getUrlByShortCode, incrementClickCount } = require('./database/urls');
    const { shortCode } = req.params;
    
    const urlData = await getUrlByShortCode(shortCode);
    
    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    await incrementClickCount(shortCode);
    
    res.redirect(302, urlData.original_url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();