const passengerModel = require('../models/passenger');

const loginPassenger = async (req, res) => {
    const { passenger_id, password_hash } = req.body;

    console.log("Login attempt:", { passenger_id, password_provided: !!password_hash });

    if (!passenger_id || !password_hash) {
        return res.status(400).json({ 
            success: false, 
            message: "Passenger ID and password are required" 
        });
    }

    try {
        const result = await passengerModel.loginPassenger(passenger_id, password_hash);
        if (result.success) {
            res.json({ 
                success: true, 
                user: result.user,
                message: "Login successful"
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: result.message 
            });
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ 
            success: false,
            error: "Database connection error",
            message: "Unable to process login request"
        });
    }
};

const checkPassenger = async (req, res) => {
    try {
        const result = await passengerModel.checkPassenger(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    loginPassenger,
    checkPassenger,
};