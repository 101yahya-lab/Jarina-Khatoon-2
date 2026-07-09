const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  checkinPatient,
  getQueue,
  savePrescription
} = require('../controllers/opdController');

router.post('/checkin', verifyToken, checkinPatient);
router.get('/queue', verifyToken, getQueue);
router.put('/:visit_id/prescription', verifyToken, savePrescription);

module.exports = router;