const pool = require('../config/db');

// ========================================
// OPD Check-In
// POST /api/opd/checkin
// ========================================
async function checkinPatient(req, res) {

  try {

    const { patient_id, complaint } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID zaroori hai.'
      });
    }

    // Generate Next Token
    const [tokenRows] = await pool.query(
      `SELECT MAX(token_number) AS max_token
       FROM opd_visits
       WHERE visit_date = CURDATE()`
    );

    const nextToken = (tokenRows[0].max_token || 0) + 1;

    const [result] = await pool.query(
      `INSERT INTO opd_visits
      (
        patient_id,
        token_number,
        complaint,
        status
      )
      VALUES
      (?, ?, ?, 'waiting')`,
      [
        patient_id,
        nextToken,
        complaint ? complaint.trim() : null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Patient OPD line mein add ho gaya.',
      visit_id: result.insertId,
      token_number: nextToken
    });

  } catch (err) {

    console.error("CHECKIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal Server Error'
    });

  }

}

// ========================================
// Today's Queue
// GET /api/opd/queue
// ========================================
async function getQueue(req, res) {

  try {

    const [rows] = await pool.query(
      `SELECT
        v.id AS visit_id,
        v.token_number,
        v.status,
        v.complaint,
        p.id AS patient_id,
        p.hba_id,
        p.full_name,
        p.age,
        p.gender,
        p.phone
      FROM opd_visits v
      JOIN patients p
      ON v.patient_id = p.id
      WHERE
        v.visit_date = CURDATE()
        AND v.status <> 'completed'
      ORDER BY v.token_number ASC`
    );

    return res.json({
      success: true,
      total: rows.length,
      queue: rows
    });

  } catch (err) {

    console.error("QUEUE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal Server Error'
    });

  }

}

// ========================================
// Save Prescription
// PUT /api/opd/:visit_id/prescription
// ========================================
async function savePrescription(req, res) {

  try {

    const { visit_id } = req.params;

    const {
      diagnosis,
      prescription
    } = req.body;

    const seen_by = req.user ? req.user.id : null;

    const [result] = await pool.query(
      `UPDATE opd_visits
      SET
        diagnosis = ?,
        prescription = ?,
        status = 'completed',
        seen_by = ?
      WHERE id = ?`,
      [
        diagnosis ? diagnosis.trim() : null,
        prescription ? prescription.trim() : null,
        seen_by,
        visit_id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visit nahi mila.'
      });
    }

    return res.json({
      success: true,
      message: 'Prescription successfully save ho gayi.'
    });

  } catch (err) {

    console.error("PRESCRIPTION ERROR:", err);

    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal Server Error'
    });

  }

}

module.exports = {
  checkinPatient,
  getQueue,
  savePrescription
};