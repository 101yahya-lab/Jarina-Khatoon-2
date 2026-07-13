const express = require('express');
const router = express.Router();

const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

const {
  checkinPatient,
  getQueue,
  savePrescription
} = require('../controllers/opdController');

// ========================================
// OPD API Status
// ========================================
router.get('/status', (req, res) => {
  return res.status(200).json({
    success: true,
    service: 'OPD API',
    status: 'Running',
    timestamp: new Date()
  });
});

// ========================================
// Check-In Patient
// POST /api/opd/checkin
// Admin + Reception
// ========================================
router.post(
  '/checkin',
  verifyToken,
  allowRoles('admin', 'reception'),
  checkinPatient
);

// ========================================
// Today's Queue
// GET /api/opd/queue
// Admin + Reception + Doctor
// ========================================
router.get(
  '/queue',
  verifyToken,
  allowRoles('admin', 'reception', 'doctor'),
  getQueue
);

// ========================================
// Save Prescription
// PUT /api/opd/:visit_id/prescription
// Doctor Only
// ========================================
router.put(
  '/:visit_id/prescription',
  verifyToken,
  allowRoles('doctor'),
  savePrescription
);

// ========================================
// Invalid OPD Route
// ========================================
router.all('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'OPD route not found.'
  });
});

module.exports = router;