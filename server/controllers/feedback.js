const feedbackModel = require('../models/feedback');

const submitFeedback = async (req, res) => {
    const { passenger_id, ticket_id, subject, message } = req.body;
    if (!passenger_id || !ticket_id || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const feedback = await feedbackModel.addFeedback(passenger_id, ticket_id, subject, message);
        res.status(201).json({ success: true, feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.getAllFeedback();
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateFeedbackStatus = async (req, res) => {
    const { feedback_id, status } = req.body;
    if (!feedback_id || !status) {
        return res.status(400).json({ error: 'feedback_id and status are required.' });
    }
    try {
        const updated = await feedbackModel.updateFeedbackStatus(feedback_id, status);
        res.json({ success: true, feedback: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    submitFeedback,
    getAllFeedback,
    updateFeedbackStatus,
}; 