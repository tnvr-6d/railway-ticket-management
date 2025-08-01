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
        r.distance,
        r.duration,
        src.station_name AS source,
        dest.station_name AS destination
      FROM schedule s
      LEFT JOIN train t ON s.train_id = t.train_id
      LEFT JOIN route r ON s.route_id = r.route_id
      LEFT JOIN station src ON r.source_station_id = src.station_id
      LEFT JOIN station dest ON r.destination_station_id = dest.station_id
      ORDER BY s.departure_date, s.departure_time;
    `);
    return result.rows;
};

const searchSchedules = async (source, destination, departure_date, class_type) => {
    const query = `
        WITH all_route_stations AS (
            SELECT route_id, station_id, arrival_time, 0 as is_endpoint FROM route_station
            UNION ALL
            SELECT route_id, source_station_id as station_id, NULL as arrival_time, 1 as is_endpoint FROM route
            UNION ALL
            SELECT route_id, destination_station_id as station_id, NULL as arrival_time, 1 as is_endpoint FROM route
        )
        SELECT DISTINCT
            s.schedule_id,
            s.train_id,
            s.departure_time, s.arrival_time, s.departure_date, s.status,
            t.train_name,
            r.distance, r.duration,
            src.station_name AS source,
            dest.station_name AS destination,
            cl.class_type,
            cl.class_id,
            (
                SELECT ARRAY_AGG(st.station_name ORDER BY rs.arrival_time)
                FROM route_station rs
                JOIN station st ON rs.station_id = st.station_id
                WHERE rs.route_id = r.route_id
                  AND st.station_id != r.source_station_id
                  AND st.station_id != r.destination_station_id
            ) AS intermediate_stations,
            (
                SELECT COUNT(*) FROM seat_inventory si2
                JOIN coach c2 ON si2.coach_id = c2.coach_id
                JOIN class cl2 ON c2.class_id = cl2.class_id
                WHERE si2.schedule_id = s.schedule_id AND cl2.class_type = cl.class_type
            ) AS total_seats,
            (
                SELECT COUNT(*) FROM seat_inventory si2
                JOIN coach c2 ON si2.coach_id = c2.coach_id
                JOIN class cl2 ON c2.class_id = cl2.class_id
                WHERE si2.schedule_id = s.schedule_id AND cl2.class_type = cl.class_type AND si2.is_available = TRUE
            ) AS available_seats
        FROM schedule s
        JOIN train t ON s.train_id = t.train_id
        JOIN route r ON s.route_id = r.route_id
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        JOIN seat_inventory si ON s.schedule_id = si.schedule_id
        JOIN coach c ON si.coach_id = c.coach_id
        JOIN class cl ON c.class_id = cl.class_id
        JOIN all_route_stations ars_from ON ars_from.route_id = r.route_id
        JOIN all_route_stations ars_to ON ars_to.route_id = r.route_id
        JOIN station st_from ON ars_from.station_id = st_from.station_id
        JOIN station st_to ON ars_to.station_id = st_to.station_id
        WHERE st_from.station_name ILIKE $1
          AND st_to.station_name ILIKE $2
          AND (
            (
              ars_from.is_endpoint = 1 AND ars_to.is_endpoint = 1 AND src.station_name ILIKE $1 AND dest.station_name ILIKE $2
            )
            OR
            (
              (
                (ars_from.arrival_time IS NULL AND ars_to.arrival_time IS NOT NULL)
                OR (ars_from.arrival_time IS NOT NULL AND ars_to.arrival_time IS NULL)
                OR (ars_from.arrival_time IS NOT NULL AND ars_to.arrival_time IS NOT NULL AND ars_from.arrival_time < ars_to.arrival_time)
              )
            )
          )
          AND s.departure_date = $3
          AND cl.class_type = $4
        ORDER BY
          cl.class_id DESC,
          s.departure_time;
    `;
    const { rows } = await pool.query(query, [`%${source}%`, `%${destination}%`, departure_date, class_type]);
    return rows;
};
module.exports = {
    getAllSchedules,
    searchSchedules,
};