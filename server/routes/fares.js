const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { route_id, coach_number, class_type } = req.query;
  console.log("FARE QUERY →", route_id, coach_number, class_type); 
  try {
    const result = await pool.query(`
      SELECT * FROM fare
      WHERE route_id = $1 AND coach_number = $2 AND class_type = $3
    `, [route_id, coach_number, class_type]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
