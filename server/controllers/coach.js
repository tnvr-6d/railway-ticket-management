const coachModel = require('../models/coach');

const getAllCoaches = async (req, res) => {
    try {
        const coaches = await coachModel.getAllCoaches();
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCoachById = async (req, res) => {
    try {
        const { id } = req.params;
        const coach = await coachModel.getCoachById(id);
        
        if (!coach) {
            return res.status(404).json({ success: false, message: "Coach not found" });
        }
        
        res.json(coach);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCoach = async (req, res) => {
    try {
        const { coach_number, class_id } = req.body;
        
        if (!coach_number || !class_id) {
            return res.status(400).json({ success: false, message: "Coach number and class ID are required" });
        }
        
        const coach = await coachModel.createCoach({
            coach_number, class_id
        });
        
        res.status(201).json({ success: true, coach });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const { coach_number, class_id } = req.body;
        
        if (!coach_number || !class_id) {
            return res.status(400).json({ success: false, message: "Coach number and class ID are required" });
        }
        
        const coach = await coachModel.updateCoach(id, {
            coach_number, class_id
        });
        
        if (!coach) {
            return res.status(404).json({ success: false, message: "Coach not found" });
        }
        
        res.json({ success: true, coach });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const coach = await coachModel.deleteCoach(id);
        
        if (!coach) {
            return res.status(404).json({ success: false, message: "Coach not found" });
        }
        
        res.json({ success: true, message: "Coach deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCoachesByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const coaches = await coachModel.getCoachesByClass(classId);
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllCoaches,
    getCoachById,
    createCoach,
    updateCoach,
    deleteCoach,
    getCoachesByClass
}; 