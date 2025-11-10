require('dotenv').config();
const app = require('./app');

// Root endpoint for local dev convenience
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