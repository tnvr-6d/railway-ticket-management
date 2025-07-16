const pool = require('../db');


const loginPassenger = async (email, password, ip_address, device_info) => {
    let passenger;
    try {
        const userQuery = {
            text: 'SELECT passenger_id, name, email, password_hash FROM passenger WHERE email = $1',
            values: [email]
        };
        const userRes = await pool.query(userQuery);

        if (userRes.rows.length === 0) {
            throw new Error("Passenger with this email not found");
        }

        passenger = userRes.rows[0];
        
        // For this project, we use plain text comparison. In a real app, use bcrypt.
        const isMatch = password === passenger.password_hash;

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        // On success, log the attempt and return user data
        await pool.query("SELECT log_login_attempt($1, $2, $3, $4)", [passenger.passenger_id, ip_address, device_info, true]);
        
        return {
            success: true,
            user: {
                passenger_id: passenger.passenger_id,
                name: passenger.name,
                email: passenger.email
            }
        };

    } catch (err) {
        // On failure, log the attempt and re-throw the error
        const passenger_id_to_log = passenger ? passenger.passenger_id : null;
        if (passenger_id_to_log) { // Only log if we found a user
             await pool.query("SELECT log_login_attempt($1, $2, $3, $4)", [passenger_id_to_log, ip_address, device_info, false]);
        }
        throw err;
    }
};

const registerPassenger = async (name, email, password_hash, phone_number, address) => {
    try {
        const result = await pool.query(
            "INSERT INTO passenger (name, email, password_hash, phone_number, address) VALUES ($1, $2, $3, $4, $5) RETURNING passenger_id, name, email",
            [name, email, password_hash, phone_number, address]
        );
        return { success: true, user: result.rows[0] };
        
    } catch (err) {
        if (err.code === '23505') { // Unique violation (e.g., duplicate email)
            throw new Error("Email already registered. Please use a different email or login.");
        }
        throw new Error("Database error during registration: " + err.message);
    }
};

const checkPassenger = async (id) => {
    const { rows } = await pool.query("SELECT passenger_id, name FROM passenger WHERE passenger_id = $1", [id]);
    return rows[0];
};

module.exports = {
    loginPassenger,
    registerPassenger,
    checkPassenger,
};