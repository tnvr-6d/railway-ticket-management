// routes/schedules.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT 
    s.*, 
    t.train_name, t.coach_number, t.class_type,
    r.distance, r.duration,
    src.station_name AS source,
    dest.station_name AS destination
  FROM schedule s
  JOIN train t ON s.train_id = t.train_id
  JOIN route r ON s.route_id = r.route_id
  JOIN station src ON r.source_station_id = src.station_id
  JOIN station dest ON r.destination_station_id = dest.station_id
  ORDER BY departure_date, departure_time
`);


    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
