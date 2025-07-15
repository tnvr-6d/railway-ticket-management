const pool = require('../db');

const getSeatsBySchedule = async (schedule_id) => {
    const result = await pool.query(`
      SELECT * FROM seat_inventory
      WHERE schedule_id = $1
      ORDER BY coach_number, row_number, column_number
    `, [schedule_id]);
    return result.rows;
};

module.exports = {
    getSeatsBySchedule,
};