const pool = require('../db');

const assignCoachToTrain = async (trainId, coachId, coachOrder) => {
    const result = await pool.query(`
        INSERT INTO train_coach (train_id, coach_id, coach_order)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [trainId, coachId, coachOrder]);
    
    return result.rows[0];
};

const getTrainCoaches = async (trainId) => {
    const result = await pool.query(`
        SELECT 
            tc.train_coach_id,
            tc.coach_order,
            c.coach_number,
            cl.class_type,
            cl.class_id
        FROM train_coach tc
        JOIN coach c ON tc.coach_id = c.coach_id
        JOIN class cl ON c.class_id = cl.class_id
        WHERE tc.train_id = $1
        ORDER BY tc.coach_order
    `, [trainId]);
    return result.rows;
};

const updateCoachOrder = async (trainCoachId, coachOrder) => {
    const result = await pool.query(`
        UPDATE train_coach 
        SET coach_order = $1
        WHERE train_coach_id = $2
        RETURNING *
    `, [coachOrder, trainCoachId]);
    
    return result.rows[0];
};

const removeCoachFromTrain = async (trainCoachId) => {
    const result = await pool.query(`
        DELETE FROM train_coach 
        WHERE train_coach_id = $1
        RETURNING *
    `, [trainCoachId]);
    
    return result.rows[0];
};

const getTrainComposition = async (trainId) => {
    const result = await pool.query(`
        SELECT 
            t.train_name,
            t.total_seats,
            t.description,
            tc.coach_order,
            c.coach_number,
            cl.class_type,
            cl.class_id
        FROM train t
        LEFT JOIN train_coach tc ON t.train_id = tc.train_id
        LEFT JOIN coach c ON tc.coach_id = c.coach_id
        LEFT JOIN class cl ON c.class_id = cl.class_id
        WHERE t.train_id = $1
        ORDER BY tc.coach_order
    `, [trainId]);
    return result.rows;
};

module.exports = {
    assignCoachToTrain,
    getTrainCoaches,
    updateCoachOrder,
    removeCoachFromTrain,
    getTrainComposition
}; 