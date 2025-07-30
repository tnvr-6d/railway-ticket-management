const pool = require('../db');

const getSeatsBySchedule = async (schedule_id) => {
    const result = await pool.query(`
      SELECT si.*, c.coach_number, cl.class_type
      FROM seat_inventory si
      JOIN coach c ON si.coach_id = c.coach_id
      JOIN class cl ON c.class_id = cl.class_id
      WHERE si.schedule_id = $1
      ORDER BY c.coach_number, si.row_number, si.column_number
    `, [schedule_id]);
    return result.rows;
};

module.exports = {
    getSeatsBySchedule,
};