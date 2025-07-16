const pool = require('../db');

const getFare = async (class_type) => {
    const result = await pool.query(`
      SELECT per_km_fare FROM fare
      WHERE class_type = $1
      LIMIT 1
    `, [class_type]);
    return result.rows[0];
};

module.exports = {
    getFare,
};