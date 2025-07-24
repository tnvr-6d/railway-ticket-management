const fareModel = require('../models/fare');

const getFare = async (req, res) => {
    const { class_type } = req.query;

    console.log("FARE QUERY → class_type:", class_type);

    if (!class_type) {
        return res.status(400).json({ error: "class_type is required" });
    }

    try {
        const fare = await fareModel.getFare(class_type);
        if (fare) {
            res.json(fare);
        } else {
            res.status(404).json({ error: "Fare not found for this class" });
        }
    } catch (err) {
        console.error("❌ FARES DB ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getFare,
};