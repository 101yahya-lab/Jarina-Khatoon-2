const express = require('express'); // 'Const' को बदलकर 'const' किया
const pool = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const opdRoutes = require('./routes/opdRoutes');

const app = express();

// ========================================
// CORS Configuration - Hospital Network ke liye optimized
// ========================================
const corsOptions = {
  origin: function (origin, callback) {
    // Saari requests ko allow karo (hospital network ke liye)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours cache
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests ke liye

// ========================================
// डेटाबेस कनेक्शन (Pool Verification)
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

// (नोट: यहाँ से क्रैश करने वाले पुराने connection.connect और connection.on ब्लॉक हटा दिए गए हैं)

// ========================================
// Middleware
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public')); // यह आपकी public फोल्डर की HTML फाइलों को चलाएगा

// Request logging middleware (Termianl me live request dekhne ke liye)
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
    timestamp: new Date()
  });
});

// ========================================
// Routes Application
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/opd', opdRoutes);

// ========================================
// Error Handling Middleware
// ========================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server me dikkat aa gayi',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ========================================
// 404 Handler (Galat URL ke liye)
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ye endpoint nahi mila'
  });
});

// ========================================
// सर्वर चालू करना
// ========================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Server chal raha hai!`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`🏥 API Endpoint: http://${HOST}:${PORT}/api`);
  console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;
