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

const searchSchedules = async (source, destination, departure_date, class_type) => {
    
    const query = `
        SELECT DISTINCT
            s.schedule_id, s.departure_time, s.arrival_time, s.departure_date, s.status,
            t.train_name, t.coach_number,
            r.distance, r.duration,
            src.station_name AS source,
            dest.station_name AS destination,
            c.class_type,
            c.class_id
        FROM schedule s
        JOIN train t ON s.train_id = t.train_id
        JOIN route r ON s.route_id = r.route_id
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        -- We need to join seat_inventory and class to filter and sort
        JOIN seat_inventory si ON s.schedule_id = si.schedule_id
        JOIN class c ON si.class_type = c.class_type
        WHERE src.station_name ILIKE $1
          AND dest.station_name ILIKE $2
          AND s.departure_date = $3
          AND si.class_type = $4 -- Filter by class type
        ORDER BY
          c.class_id DESC, -- Sort by class_id as requested
          s.departure_time;
    `;
    const { rows } = await pool.query(query, [`%${source}%`, `%${destination}%`, departure_date, class_type]);
    return rows;
};
module.exports = {
    getAllSchedules,
    searchSchedules,
};