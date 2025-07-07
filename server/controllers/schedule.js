const scheduleModel = require('../models/schedule');

const getAllSchedules = async (req, res) => {
    try {
        const schedules = await scheduleModel.getAllSchedules();
        res.json(schedules);
    } catch (err) {
        console.error("❌ Error fetching schedules:", err);
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};

const searchSchedules = async (req, res) => {
    const { source, destination, departure_date } = req.query;
    if (!source || !destination || !departure_date) {
        return res.status(400).json({ error: "source, destination, and departure_date are required" });
    }
    try {
        const schedules = await scheduleModel.searchSchedules(source, destination, departure_date);
        res.json(schedules);
    } catch (err) {
        console.error("❌ Error searching schedules:", err);
        res.status(500).json({ error: "Failed to search schedules" });
    }
};

module.exports = {
    getAllSchedules,
    searchSchedules,
};