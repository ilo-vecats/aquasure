const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: "https://aquasurefrontend-13yla4ihz-rishikadawra1104-8048s-projects.vercel.app/" || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/samples', require('./routes/samples'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/spc', require('./routes/spc'));
app.use('/api/qc-tools', require('./routes/qcTools'));
app.use('/api/qms', require('./routes/qms'));
app.use('/api/improvement', require('./routes/improvement'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/predictions', require('./routes/predictions'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AquaSure API is running' });
});

module.exports = app;


