const classModel = require('../models/class');

const getAllClasses = async (req, res) => {
    try {
        const classes = await classModel.getAllClasses();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch class types" });
    }
};

module.exports = {
    getAllClasses,
};