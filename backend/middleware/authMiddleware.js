const jwt = require('jsonwebtoken');
require('dotenv').config();

// ========================================
// JWT Secret Check
// ========================================
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  throw new Error('JWT_SECRET is missing in .env file');
}

// ========================================
// Verify JWT Token
// ========================================
function verifyToken(req, res, next) {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token nahi mila.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (err) {

    console.error("JWT ERROR:", err.message);

    return res.status(401).json({
      success: false,
      message: 'Token invalid ya expire ho gaya.'
    });

  }

}

// ========================================
// Role Based Access Control
// ========================================
function allowRoles(...roles) {

  return (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: 'User authenticate nahi hai.'
      });

    }

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({
        success: false,
        message: 'Is action ki permission nahi hai.'
      });

    }

    next();

  };

}

// ========================================
// Export
// ========================================
module.exports = {
  verifyToken,
  allowRoles
};