const seatModel = require('../models/seat');

const getSeatsBySchedule = async (req, res) => {
    const { schedule_id } = req.query;
    try {
        const seats = await seatModel.getSeatsBySchedule(schedule_id);
        res.json(seats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getSeatsBySchedule,
};