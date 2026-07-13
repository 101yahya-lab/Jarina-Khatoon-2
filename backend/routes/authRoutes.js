const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

// ========================================
// Health Check
// ========================================
router.get('/status', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authentication API Working',
    timestamp: new Date()
  });
});

// ========================================
// Authentication Routes
// ========================================
router.post('/register', register);
router.post('/login', login);

// ========================================
// Export Router
// ========================================
module.exports = router;