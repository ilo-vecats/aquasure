require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// CORS configuration - allow all origins for free tier deployment
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/samples', require('./routes/samples'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AquaSure API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AquaSure API - Drinking Water Quality Check System',
    version: '1.0.0',
    endpoints: {
      samples: '/api/samples',
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 AquaSure Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

