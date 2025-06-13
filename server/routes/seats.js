const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { schedule_id } = req.query;
  try {
    const result = await pool.query(`
      SELECT * FROM seat_inventory
      WHERE schedule_id = $1
      ORDER BY coach_number, row_number, column_number
    `, [schedule_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
