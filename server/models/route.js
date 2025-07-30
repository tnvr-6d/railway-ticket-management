const pool = require('../db');

const getAllRoutes = async () => {
    const result = await pool.query(`
        SELECT 
            r.route_id,
            r.distance,
            r.duration,
            r.created_at,
            src.station_name AS source,
            dest.station_name AS destination,
            src.station_id AS source_id,
            dest.station_id AS destination_id
        FROM route r
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        ORDER BY r.route_id
    `);
    return result.rows;
};

const getRouteById = async (routeId) => {
    const result = await pool.query(`
        SELECT 
            r.route_id,
            r.distance,
            r.duration,
            r.created_at,
            src.station_name AS source,
            dest.station_name AS destination,
            src.station_id AS source_id,
            dest.station_id AS destination_id
        FROM route r
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        WHERE r.route_id = $1
    `, [routeId]);
    return result.rows[0];
};

const createRoute = async (routeData) => {
    const { source_station_id, destination_station_id, distance, duration } = routeData;
    
    const result = await pool.query(`
        INSERT INTO route (source_station_id, destination_station_id, distance, duration)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [source_station_id, destination_station_id, distance, duration]);
    
    return result.rows[0];
};

const updateRoute = async (routeId, routeData) => {
    const { source_station_id, destination_station_id, distance, duration } = routeData;
    
    const result = await pool.query(`
        UPDATE route 
        SET source_station_id = $1, destination_station_id = $2, distance = $3, duration = $4
        WHERE route_id = $5
        RETURNING *
    `, [source_station_id, destination_station_id, distance, duration, routeId]);
    
    return result.rows[0];
};

const deleteRoute = async (routeId) => {
    // Check if route has any schedules
    const schedulesResult = await pool.query(`
        SELECT COUNT(*) as schedule_count FROM schedule WHERE route_id = $1
    `, [routeId]);
    
    if (parseInt(schedulesResult.rows[0].schedule_count) > 0) {
        throw new Error("Cannot delete route with existing schedules");
    }
    
    const result = await pool.query(`DELETE FROM route WHERE route_id = $1 RETURNING *`, [routeId]);
    return result.rows[0];
};

const getRouteStations = async (routeId) => {
    const result = await pool.query(`
        SELECT 
            rs.route_station_id,
            rs.arrival_time,
            rs.departure_time,
            s.station_name,
            s.location,
            s.contact_info
        FROM route_station rs
        JOIN station s ON rs.station_id = s.station_id
        WHERE rs.route_id = $1
        ORDER BY rs.arrival_time, rs.departure_time
    `, [routeId]);
    return result.rows;
};

const addStationToRoute = async (routeId, stationId, arrivalTime, departureTime) => {
    const result = await pool.query(`
        INSERT INTO route_station (route_id, station_id, arrival_time, departure_time)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [routeId, stationId, arrivalTime, departureTime]);
    
    return result.rows[0];
};

const removeStationFromRoute = async (routeStationId) => {
    const result = await pool.query(`
        DELETE FROM route_station 
        WHERE route_station_id = $1
        RETURNING *
    `, [routeStationId]);
    
    return result.rows[0];
};

module.exports = {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    getRouteStations,
    addStationToRoute,
    removeStationFromRoute
}; 