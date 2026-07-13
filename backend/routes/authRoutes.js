const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

// ========================================
// Authentication API Status
// ========================================
router.get('/status', (req, res) => {
  return res.status(200).json({
    success: true,
    service: 'Authentication API',
    status: 'Running',
    timestamp: new Date()
  });
});

// ========================================
// Register New User
// POST /api/auth/register
// ========================================
router.post('/register', register);

// ========================================
// Login User
// POST /api/auth/login
// ========================================
router.post('/login', login);

// ========================================
// Invalid Auth Route
// ========================================
router.all('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Authentication route not found.'
  });
});

module.exports = router;