const pool = require("../db");


const searchStationsByName = async (query) => {
    const sql = `
        SELECT station_name FROM station 
        WHERE station_name ILIKE $1 
        ORDER BY station_name 
        LIMIT 10;
    `;
    const values = [`%${query}%`];
    const { rows } = await pool.query(sql, values);
    return rows;
};

module.exports = {
    searchStationsByName,
};