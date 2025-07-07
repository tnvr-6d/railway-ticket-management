const fareModel = require('../models/fare');

const getFare = async (req, res) => {
    const { coach_number, class_type } = req.query;

    console.log("FARE QUERY → coach_number:", coach_number, "class_type:", class_type);

    if (!coach_number || !class_type) {
        return res.status(400).json({ error: "coach_number and class_type are required" });
    }

    try {
        const fare = await fareModel.getFare(coach_number, class_type);
        if (fare) {
            res.json(fare);
        } else {
            res.status(404).json({ error: "Fare not found for this combination" });
        }
    } catch (err) {
        console.error("❌ FARES DB ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getFare,
};