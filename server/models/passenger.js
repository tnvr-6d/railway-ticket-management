const pool = require('../db');
//const bcrypt = require('bcrypt');

const loginPassenger = async (identifier, password) => {
    let userQuery;
    // Check if the identifier is purely numeric
    const isNumeric = /^\d+$/.test(identifier);

    if (isNumeric) {
        // Login by Passenger ID
        userQuery = {
            text: 'SELECT passenger_id, name, password_hash FROM passenger WHERE passenger_id = $1',
            values: [parseInt(identifier, 10)]
        };
    } else {
        // Login by Name (case-insensitive)
        userQuery = {
            text: 'SELECT passenger_id, name, password_hash FROM passenger WHERE name ILIKE $1',
            values: [identifier]
        };
    }

    const userRes = await pool.query(userQuery);

    if (userRes.rows.length === 0) {
        throw new Error("Passenger not found");
    }

    const passenger = userRes.rows[0];

    // In a real app, use bcrypt.compare. For this project, we use plain text comparison.
    // const isMatch = await bcrypt.compare(password, passenger.password_hash);
    const isMatch = password === passenger.password_hash;

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // Return the full user object on success, excluding the password hash
    return {
        success: true,
        user: {
            passenger_id: passenger.passenger_id,
            name: passenger.name
        }
    };
};

// ... keep checkPassenger function if it exists
const checkPassenger = async (id) => {
    const { rows } = await pool.query("SELECT passenger_id, name FROM passenger WHERE passenger_id = $1", [id]);
    return rows[0];
};

module.exports = {
    loginPassenger,
    checkPassenger,
};