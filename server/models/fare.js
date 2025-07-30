const pool = require('../db');

const getFare = async (class_type) => {
    const result = await pool.query(`
      SELECT f.per_km_fare FROM fare f
      JOIN class c ON f.class_id = c.class_id
      WHERE c.class_type = $1
      LIMIT 1
    `, [class_type]);
    return result.rows[0];
};

module.exports = {
    getFare,
};