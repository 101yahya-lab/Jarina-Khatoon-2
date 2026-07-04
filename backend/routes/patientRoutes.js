const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  registerPatient,
  getAllPatients,
  getPatientByHbaId,
  getTodayQueue
} = require('../controllers/patientController');

// Sabhi routes login-protected hain (token required)
router.post('/', verifyToken, registerPatient);
router.get('/', verifyToken, getAllPatients);
router.get('/today-queue', verifyToken, getTodayQueue);
router.get('/:hba_id', verifyToken, getPatientByHbaId);

module.exports = router;
