const express = require('express');
const router = express.Router();
const pool = require('../db');

/*router.get('/', async (req, res) => {
  const { route_id, coach_number, class_type } = req.query;

  console.log("FARE QUERY →", route_id, coach_number, class_type);

  try {
    const result = await pool.query(`
      SELECT * FROM fare
      WHERE route_id = $1 AND coach_number = $2 AND class_type = $3
    `, [route_id, coach_number, class_type]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Fare not found" });
    }
  } catch (err) {
    console.error("❌ DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;*/

// File: server/routes/fares.js



router.get('/', async (req, res) => {
  // The fare depends only on coach and class, not route.
  const { coach_number, class_type } = req.query;

  console.log("FARE QUERY → coach_number:", coach_number, "class_type:", class_type);

  if (!coach_number || !class_type) {
    return res.status(400).json({ error: "coach_number and class_type are required" });
  }

  try {
    const result = await pool.query(`
      SELECT per_km_fare FROM fare
      WHERE coach_number = $1 AND class_type = $2
    `, [coach_number, class_type]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Fare not found for this combination" });
    }
  } catch (err) {
    console.error("❌ FARES DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



