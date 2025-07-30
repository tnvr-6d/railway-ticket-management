const trainCoachModel = require('../models/trainCoach');

const assignCoachToTrain = async (req, res) => {
    try {
        const { trainId } = req.params;
        const { coach_id, coach_order } = req.body;
        
        if (!coach_id || !coach_order) {
            return res.status(400).json({ success: false, message: "Coach ID and coach order are required" });
        }
        
        const trainCoach = await trainCoachModel.assignCoachToTrain(trainId, coach_id, coach_order);
        
        res.status(201).json({ success: true, trainCoach });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTrainCoaches = async (req, res) => {
    try {
        const { trainId } = req.params;
        const trainCoaches = await trainCoachModel.getTrainCoaches(trainId);
        res.json(trainCoaches);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCoachOrder = async (req, res) => {
    try {
        const { trainCoachId } = req.params;
        const { coach_order } = req.body;
        
        if (!coach_order) {
            return res.status(400).json({ success: false, message: "Coach order is required" });
        }
        
        const trainCoach = await trainCoachModel.updateCoachOrder(trainCoachId, coach_order);
        
        if (!trainCoach) {
            return res.status(404).json({ success: false, message: "Train coach relationship not found" });
        }
        
        res.json({ success: true, trainCoach });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeCoachFromTrain = async (req, res) => {
    try {
        const { trainCoachId } = req.params;
        const trainCoach = await trainCoachModel.removeCoachFromTrain(trainCoachId);
        
        if (!trainCoach) {
            return res.status(404).json({ success: false, message: "Train coach relationship not found" });
        }
        
        res.json({ success: true, message: "Coach removed from train successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTrainComposition = async (req, res) => {
    try {
        const { trainId } = req.params;
        const composition = await trainCoachModel.getTrainComposition(trainId);
        res.json(composition);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    assignCoachToTrain,
    getTrainCoaches,
    updateCoachOrder,
    removeCoachFromTrain,
    getTrainComposition
}; 