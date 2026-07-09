const express = require('express');
const router = express.Router();
// यहाँ verifyToken के साथ allowRoles को भी इम्पोर्ट कर लिया
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
  registerPatient,
  getAllPatients,
  getPatientByHbaId,
  getTodayQueue
} = require('../controllers/patientController');

// ========================================
// Patient Routes (Token + Role Protected)
// ========================================

// 1. नया पेशेंट सिर्फ Admin और Receptionist ही रजिस्टर कर सकते हैं
router.post('/', verifyToken, allowRoles('admin', 'reception'), registerPatient);

// 2. आज की Queue को Admin, Reception और Doctor तीनों देख सकते हैं
// (नोट: /today-queue को /:hba_id से ऊपर रखना जरूरी था, जो आपने बिल्कुल सही किया है)
router.get('/today-queue', verifyToken, allowRoles('admin', 'reception', 'doctor'), getTodayQueue);

// 3. सभी पेशेंट्स की लिस्ट देखने की परमिशन
router.get('/', verifyToken, allowRoles('admin', 'reception', 'doctor'), getAllPatients);

// 4. किसी खास पेशेंट का डेटा HBA ID से निकालना
router.get('/:hba_id', verifyToken, allowRoles('admin', 'reception', 'doctor'), getPatientByHbaId);

module.exports = router;
