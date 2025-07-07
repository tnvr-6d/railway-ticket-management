const pool = require('../db');

const loginPassenger = async (passenger_id, password_hash) => {
    const result = await pool.query(
        `SELECT passenger_id, name, email FROM passenger WHERE passenger_id = $1 AND password_hash = $2`,
        [passenger_id, password_hash]
    );

    if (result.rows.length === 1) {
        return { success: true, user: result.rows[0] };
    } else {
        const passengerCheck = await pool.query(
            `SELECT passenger_id FROM passenger WHERE passenger_id = $1`,
            [passenger_id]
        );
        if (passengerCheck.rows.length === 0) {
            return { success: false, message: "Passenger ID not found" };
        } else {
            return { success: false, message: "Invalid password" };
        }
    }
};

const checkPassenger = async (passenger_id) => {
    const result = await pool.query(
        `SELECT passenger_id, name, email FROM passenger WHERE passenger_id = $1`,
        [passenger_id]
    );
    if (result.rows.length > 0) {
        return { exists: true, passenger: result.rows[0] };
    } else {
        return { exists: false };
    }
};

module.exports = {
    loginPassenger,
    checkPassenger,
};