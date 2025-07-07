const pool = require('../db');

const getFare = async (coach_number, class_type) => {
    const result = await pool.query(`
      SELECT per_km_fare FROM fare
      WHERE coach_number = $1 AND class_type = $2
    `, [coach_number, class_type]);
    return result.rows[0];
};

module.exports = {
    getFare,
};