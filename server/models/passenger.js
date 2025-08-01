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
    const { rows } = await pool.query("SELECT passenger_id, name, email, phone_number, address FROM passenger WHERE passenger_id = $1", [id]);
    return rows[0];
};

const getAllPassengersWithDiscounts = async () => {
    const { rows } = await pool.query(`
        SELECT 
            p.passenger_id,
            p.name as passenger_name,
            p.email,
            p.phone_number as phone,
            p.address,
            p.created_at,
            CASE 
                WHEN active_discount.discount_id IS NOT NULL THEN true 
                ELSE false 
            END as active_discount,
            active_discount.code as discount_code,
            active_discount.discount_percentage
        FROM passenger p
        LEFT JOIN (
            SELECT DISTINCT ON (d.passenger_id) 
                d.passenger_id,
                d.discount_id,
                d.code,
                d.discount_percentage
            FROM discount d
            JOIN discount_info di ON d.discount_id = di.discount_id
            WHERE di.is_active = true
            AND CURRENT_DATE BETWEEN di.start_date AND di.end_date
            ORDER BY d.passenger_id, d.discount_id DESC
        ) AS active_discount ON p.passenger_id = active_discount.passenger_id
        ORDER BY p.passenger_id
    `);
    return rows;
};

module.exports = {
    loginPassenger,
    registerPassenger,
    checkPassenger,
    getAllPassengersWithDiscounts,
};