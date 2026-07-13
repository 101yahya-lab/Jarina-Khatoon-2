const express = require('express');
const router = express.Router();

const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

const {
  registerPatient,
  getAllPatients,
  getPatientByHbaId,
  getTodayQueue
} = require('../controllers/patientController');

// ========================================
// Patient API Status
// ========================================
router.get('/status', (req, res) => {
  return res.status(200).json({
    success: true,
    service: 'Patient API',
    status: 'Running',
    timestamp: new Date()
  });
});

// ========================================
// Register New Patient
// POST /api/patients
// Admin + Reception
// ========================================
router.post(
  '/',
  verifyToken,
  allowRoles('admin', 'reception'),
  registerPatient
);

// ========================================
// Today's Queue
// GET /api/patients/today-queue
// Admin + Reception + Doctor
// ========================================
router.get(
  '/today-queue',
  verifyToken,
  allowRoles('admin', 'reception', 'doctor'),
  getTodayQueue
);

// ========================================
// Get All Patients
// GET /api/patients
// Admin + Reception + Doctor
// ========================================
router.get(
  '/',
  verifyToken,
  allowRoles('admin', 'reception', 'doctor'),
  getAllPatients
);

// ========================================
// Get Patient By HBA ID
// GET /api/patients/:hba_id
// Admin + Reception + Doctor
// ========================================
router.get(
  '/:hba_id',
  verifyToken,
  allowRoles('admin', 'reception', 'doctor'),
  getPatientByHbaId
);

// ========================================
// Invalid Patient Route
// ========================================
router.all('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Patient route not found.'
  });
});

module.exports = router;