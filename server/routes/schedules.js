
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all schedules with robust LEFT JOINs
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
        t.train_name,
        t.coach_number,
        t.class_type,
        r.distance,
        r.duration,
        src.station_name AS source,
        dest.station_name AS destination,
        f.per_km_fare
      FROM schedule s
      LEFT JOIN train t ON s.train_id = t.train_id
      LEFT JOIN route r ON s.route_id = r.route_id
      LEFT JOIN station src ON r.source_station_id = src.station_id
      LEFT JOIN station dest ON r.destination_station_id = dest.station_id
      LEFT JOIN fare f ON t.coach_number = f.coach_number AND t.class_type = f.class_type
      ORDER BY s.departure_date, s.departure_time;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// GET search results with robust LEFT JOINs
router.get("/search", async (req, res) => {
  const { source, destination, departure_date } = req.query;
  if (!source || !destination || !departure_date) {
    return res.status(400).json({ error: "source, destination, and departure_date are required" });
  }
  try {
    const result = await pool.query(`
      SELECT 
        s.schedule_id, s.train_id, s.route_id, s.departure_time, s.arrival_time,
        s.departure_date, s.status, t.train_name, t.coach_number, t.class_type,
        r.distance, r.duration, src.station_name AS source, dest.station_name AS destination,
        f.per_km_fare
      FROM schedule s
      LEFT JOIN train t ON s.train_id = t.train_id
      LEFT JOIN route r ON s.route_id = r.route_id
      LEFT JOIN station src ON r.source_station_id = src.station_id
      LEFT JOIN station dest ON r.destination_station_id = dest.station_id
      LEFT JOIN fare f ON t.coach_number = f.coach_number AND t.class_type = f.class_type
      WHERE src.station_name ILIKE $1 
        AND dest.station_name ILIKE $2 
        AND s.departure_date = $3
      ORDER BY s.departure_date, s.departure_time;
    `, [`%${source}%`, `%${destination}%`, departure_date]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error searching schedules:", err);
    res.status(500).json({ error: "Failed to search schedules" });
  }
});

module.exports = router;
