const express = require('express'); // 'Const' को बदलकर 'const' किया
const router = express.Router();
// यहाँ verifyToken के साथ allowRoles को भी इम्पोर्ट किया
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
  checkinPatient,
  getQueue,
  savePrescription
} = require('../controllers/opdController');

// 1. मरीज को OPD लाइन में सिर्फ Admin या Receptionist ही लगा सकते हैं
router.post('/checkin', verifyToken, allowRoles('admin', 'reception'), checkinPatient);

// 2. आज की वेटिंग लिस्ट Admin, Reception और Doctor तीनों देख सकते हैं
router.get('/queue', verifyToken, allowRoles('admin', 'reception', 'doctor'), getQueue);

// 3. मरीज का पर्चा (Prescription) सिर्फ और सिर्फ DOCTOR ही सेव कर सकता है
router.put('/:visit_id/prescription', verifyToken, allowRoles('doctor'), savePrescription);

module.exports = router;
