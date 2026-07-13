const express = require('express');
const pool = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// ========================================
// JWT_SECRET Check (Fail Fast)
// ========================================
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('\n====================================================');
  console.error('❌ ERROR: JWT_SECRET is missing in your .env file');
  console.error('👉 Please add: JWT_SECRET=your_super_secret_key');
  console.error('====================================================\n');
  process.exit(1);
}

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const opdRoutes = require('./routes/opdRoutes');

const app = express();

// ========================================
// CORS Configuration
// ========================================
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ========================================
// Database Connection Check
// ========================================
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database Connected Successfully (Pool Active)');
    conn.release();
  } catch (err) {
    console.error('❌ Database Connection Failed:', err.message);
    process.exit(1);
  }
})();

// ========================================
// Middleware
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================================
// Health Check Routes
// ========================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hasan Babu Ka Aspataal API chal raha hai.',
    timestamp: new Date(),
    status: 'online'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server healthy hai',
    timestamp: new Date(),
    jwt: 'Configured'
  });
});

// ========================================
// API Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/opd', opdRoutes);

// ========================================
// Error Handler
// ========================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server me dikkat aa gayi',
    error:
      process.env.NODE_ENV === 'development'
        ? err.stack
        : 'Internal Server Error'
  });
});

// ========================================
// 404 Handler
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ye endpoint nahi mila'
  });
});

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('\n====================================================');
  console.log('🚀 Hasan Babu Hospital Server Started Successfully');
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`🏥 API: http://${HOST}:${PORT}/api`);
  console.log(`❤️ Health: http://${HOST}:${PORT}/health`);
  console.log('====================================================\n');
});

module.exports = app;