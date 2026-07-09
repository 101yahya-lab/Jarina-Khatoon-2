const express = require('express'); // 'Const' को बदलकर 'const' किया
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  registerPatient,
  getAllPatients,
  getPatientByHbaId,
  getTodayQueue
} = require('../controllers/patientController');

// Roles को चेक करने के लिए एक छोटा Middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Aapko is kaam ki permission nahi hai.'
      });
    }
    next();
  };
};

// ========================================
// Patient Routes (Token + Role Protected)
// ========================================

// नया पेशेंट सिर्फ Admin और Receptionist ही रजिस्टर कर सकते हैं
router.post('/', verifyToken, checkRole(['admin', 'reception']), registerPatient);

// पेशेंट लिस्ट और आज की Queue को Admin, Reception और Doctor तीनों देख सकते हैं
router.get('/', verifyToken, checkRole(['admin', 'reception', 'doctor']), getAllPatients);
router.get('/today-queue', verifyToken, checkRole(['admin', 'reception', 'doctor']), getTodayQueue);
router.get('/:hba_id', verifyToken, checkRole(['admin', 'reception', 'doctor']), getPatientByHbaId);

// नोट: पेशेंट को एडिट (Update) करने का राउट यहाँ गायब है, उसे कंट्रोलर बनाने के बाद जोड़ेंगे।

module.exports = router;
