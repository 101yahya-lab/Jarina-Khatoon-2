const pool = require('../config/db'); // 'Const' को 'const' किया

// POST /api/opd/checkin  { patient_id, complaint }
// मरीज को OPD लाइन में लगाने और टोकन देने के लिए
async function checkinPatient(req, res) {
  try {
    const { patient_id, complaint } = req.body;
    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'Patient ID zaroori hai.' });
    }

    // COUNT(*) की जगह MAX(token_number) किया ताकि टोकन नंबर कभी आपस में न टकराएं
    const [tokenRows] = await pool.query(
      `SELECT MAX(token_number) AS max_token FROM opd_visits WHERE visit_date = CURDATE()`
    );
    const nextToken = (tokenRows[0].max_token || 0) + 1;

    const [result] = await pool.query(
      `INSERT INTO opd_visits (patient_id, token_number, complaint, status)
       VALUES (?, ?, ?, 'waiting')`,
      [patient_id, nextToken, complaint || null]
    );

    res.status(201).json({
      success: true,
      message: 'Patient OPD line mein add ho gaya.',
      visit_id: result.insertId,
      token_number: nextToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
}

// GET /api/opd/queue
// आज के उन मरीजों की लिस्ट जो अभी डॉक्टर का इंतजार कर रहे हैं
async function getQueue(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT v.id AS visit_id, v.token_number, v.status, v.complaint,
              p.id AS patient_id, p.hba_id, p.full_name, p.age, p.gender, p.phone
       FROM opd_visits v
       JOIN patients p ON v.patient_id = p.id
       WHERE v.visit_date = CURDATE() AND v.status != 'completed'
       ORDER BY v.token_number ASC`
    );
    res.json({ success: true, queue: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
}

// PUT /api/opd/:visit_id/prescription  { diagnosis, prescription }
// डॉक्टर द्वारा मरीज का पर्चा और बीमारी सेव करने के लिए
async function savePrescription(req, res) {
  try {
    const { visit_id } = req.params;
    const { diagnosis, prescription } = req.body;
    const seen_by = req.user ? req.user.id : null;

    const [result] = await pool.query(
      `UPDATE opd_visits
       SET diagnosis = ?, prescription = ?, status = 'completed', seen_by = ?
       WHERE id = ?`,
      [diagnosis || null, prescription || null, seen_by, visit_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Visit nahi mila.' });
    }

    res.json({ success: true, message: 'Prescription save ho gayi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
}

module.exports = { checkinPatient, getQueue, savePrescription };
