const pool = require('../db');

const getAllCoaches = async () => {
    const result = await pool.query(`
        SELECT 
            c.coach_id,
            c.coach_number,
            cl.class_type,
            cl.class_id
        FROM coach c
        JOIN class cl ON c.class_id = cl.class_id
        ORDER BY c.coach_number
    `);
    return result.rows;
};

const getCoachById = async (coachId) => {
    const result = await pool.query(`
        SELECT 
            c.coach_id,
            c.coach_number,
            cl.class_type,
            cl.class_id
        FROM coach c
        JOIN class cl ON c.class_id = cl.class_id
        WHERE c.coach_id = $1
    `, [coachId]);
    return result.rows[0];
};

const createCoach = async (coachData) => {
    const { coach_number, class_id } = coachData;
    
    const result = await pool.query(`
        INSERT INTO coach (coach_number, class_id)
        VALUES ($1, $2)
        RETURNING *
    `, [coach_number, class_id]);
    
    return result.rows[0];
};

const updateCoach = async (coachId, coachData) => {
    const { coach_number, class_id } = coachData;
    
    const result = await pool.query(`
        UPDATE coach 
        SET coach_number = $1, class_id = $2
        WHERE coach_id = $3
        RETURNING *
    `, [coach_number, class_id, coachId]);
    
    return result.rows[0];
};

const deleteCoach = async (coachId) => {
    // Check if coach has any seats in inventory
    const seatsResult = await pool.query(`
        SELECT COUNT(*) as seat_count FROM seat_inventory WHERE coach_id = $1
    `, [coachId]);
    
    if (parseInt(seatsResult.rows[0].seat_count) > 0) {
        throw new Error("Cannot delete coach with existing seats in inventory");
    }
    
    const result = await pool.query(`DELETE FROM coach WHERE coach_id = $1 RETURNING *`, [coachId]);
    return result.rows[0];
};

const getCoachesByClass = async (classId) => {
    const result = await pool.query(`
        SELECT 
            c.coach_id,
            c.coach_number,
            cl.class_type
        FROM coach c
        JOIN class cl ON c.class_id = cl.class_id
        WHERE c.class_id = $1
        ORDER BY c.coach_number
    `, [classId]);
    return result.rows;
};

module.exports = {
    getAllCoaches,
    getCoachById,
    createCoach,
    updateCoach,
    deleteCoach,
    getCoachesByClass
}; 