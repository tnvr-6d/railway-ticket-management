const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ GET all schedules (default)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.schedule_id,
        s.train_id,
        s.route_id,
        s.departure_time,
        s.arrival_time,
        s.departure_date,
        s.status,
        s.created_at,
        t.train_name,
        t.coach_number,
        t.class_type,
        r.distance,
        r.duration,
        src.station_name AS source,
        dest.station_name AS destination
      FROM schedule s
      JOIN train t ON s.train_id = t.train_id
      JOIN route r ON s.route_id = r.route_id
      JOIN station src ON r.source_station_id = src.station_id
      JOIN station dest ON r.destination_station_id = dest.station_id
      ORDER BY s.departure_date, s.departure_time;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// ✅ Filter schedules by source, destination and departure_date
router.get("/search", async (req, res) => {
  const { source, destination, departure_date } = req.query;

  if (!source || !destination || !departure_date) {
    return res.status(400).json({ error: "source, destination, and departure_date are required" });
  }

  try {
    const result = await pool.query(`
      SELECT 
        s.schedule_id,
        s.train_id,
        s.route_id,
        s.departure_time,
        s.arrival_time,
        s.departure_date,
        s.status,
        s.created_at,
        t.train_name,
        t.coach_number,
        t.class_type,
        r.distance,
        r.duration,
        src.station_name AS source,
        dest.station_name AS destination
      FROM schedule s
      JOIN train t ON s.train_id = t.train_id
      JOIN route r ON s.route_id = r.route_id
      JOIN station src ON r.source_station_id = src.station_id
      JOIN station dest ON r.destination_station_id = dest.station_id
      WHERE src.station_name ILIKE $1
        AND dest.station_name ILIKE $2
        AND s.departure_date = $3
      ORDER BY s.departure_time;
    `, [source, destination, departure_date]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error filtering schedules:", err);
    res.status(500).json({ error: "Failed to filter schedules" });
  }
});

module.exports = router;

