const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();

// ============================================================
// CORS Configuration - Hospital Network के liye optimized
// ============================================================
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

// ============================================================
// डेटाबेस कनेक्शन
// ============================================================
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// कनेक्शन चेक करना
connection.connect((err) => {
  if (err) {
    console.error('❌ डेटाबेस जुड़ने में दिक्कत आई: ' + err.stack);
    console.error('डेटाबेस की जानकारी:');
    console.error('Host:', process.env.DB_HOST);
    console.error('User:', process.env.DB_USER);
    console.error('Database:', process.env.DB_NAME);
    console.error('Port:', process.env.DB_PORT);
    return;
  }
  console.log('✅ मुबारक हो! डेटाबेस से जुड़ गए हैं।');
});

// Connection error handler
connection.on('error', (err) => {
  console.error('डेटाबेस कनेक्शन एरर:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('डेटाबेस कनेक्शन खो गया!');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    console.error('डेटाबेस में fatal error है!');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_CLOSE') {
    console.error('डेटाबेस कनेक्शन बंद है!');
  }
});

// ============================================================
// Middleware
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// Health Check Routes
// ============================================================
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

// ============================================================
// Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// ============================================================
// Error Handling Middleware
// ============================================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server me dikkat aa gayi',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ============================================================
// 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ye endpoint nahi milha'
  });
});

// ============================================================
// सर्वर चालू करना
// ============================================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Server चल रहा है!`);
  console.log(`🌐 URL: http://${HOST}:${PORT}`);
  console.log(`📱 API Endpoint: http://${HOST}:${PORT}/api`);
  console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;
