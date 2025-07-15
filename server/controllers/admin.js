const adminModel = require('../models/admin');

const login = async (req, res) => {
    // Now expects 'email' instead of 'username'
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const result = await adminModel.loginAdmin(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

module.exports = {
    login,
};