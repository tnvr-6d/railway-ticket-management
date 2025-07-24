const pool = require('../db');

const addFeedback = async (passenger_id, ticket_id, subject, message) => {
    const result = await pool.query(
        `INSERT INTO feedback (passenger_id, ticket_id, subject, message, status)
         VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
        [passenger_id, ticket_id, subject, message]
    );
    return result.rows[0];
};

const getAllFeedback = async () => {
    const result = await pool.query(`
        SELECT f.*, p.name as passenger_name, t.train_name
        FROM feedback f
        JOIN passenger p ON f.passenger_id = p.passenger_id
        JOIN ticket tk ON f.ticket_id = tk.ticket_id
        JOIN schedule s ON tk.schedule_id = s.schedule_id
        JOIN train t ON s.train_id = t.train_id
        ORDER BY f.created_at DESC
    `);
    return result.rows;
};

const updateFeedbackStatus = async (feedback_id, status) => {
    const result = await pool.query(
        `UPDATE feedback SET status = $2 WHERE feedback_id = $1 RETURNING *`,
        [feedback_id, status]
    );
    return result.rows[0];
};

module.exports = {
    addFeedback,
    getAllFeedback,
    updateFeedbackStatus,
}; 