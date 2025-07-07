const pool = require('../db');

const getAllSchedules = async () => {
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
    return result.rows;
};

const searchSchedules = async (source, destination, departure_date) => {
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
    return result.rows;
};

module.exports = {
    getAllSchedules,
    searchSchedules,
};