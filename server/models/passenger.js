const pool = require('../db');
//const bcrypt = require('bcrypt');

const loginPassenger = async (identifier, password, ip_address, device_info) => {
    let passenger;
    try {
        let userQuery;
        const isNumeric = /^\d+$/.test(identifier);

        if (isNumeric) {
            userQuery = {
                text: 'SELECT passenger_id, name, password_hash FROM passenger WHERE passenger_id = $1',
                values: [parseInt(identifier, 10)]
            };
        } else {
            userQuery = {
                text: 'SELECT passenger_id, name, password_hash FROM passenger WHERE name ILIKE $1',
                values: [identifier]
            };
        }

        const userRes = await pool.query(userQuery);

        if (userRes.rows.length === 0) {
            throw new Error("Passenger not found");
        }

        passenger = userRes.rows[0];
        const isMatch = password === passenger.password_hash;

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        // On success, log it and return the user object
        await pool.query("SELECT log_login_attempt($1, $2, $3, $4)", [passenger.passenger_id, ip_address, device_info, true]);
        
        return {
            success: true,
            user: {
                passenger_id: passenger.passenger_id,
                name: passenger.name
            }
        };

    } catch (err) {
        // On failure, log it and re-throw the error
        const passenger_id_to_log = passenger ? passenger.passenger_id : null;
        await pool.query("SELECT log_login_attempt($1, $2, $3, $4)", [passenger_id_to_log, ip_address, device_info, false]);
        throw err;
    }
};

const checkPassenger = async (id) => {
    const { rows } = await pool.query("SELECT passenger_id, name FROM passenger WHERE passenger_id = $1", [id]);
    return rows[0];
};

module.exports = {
    loginPassenger,
    checkPassenger,
};