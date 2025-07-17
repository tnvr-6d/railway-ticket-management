const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback');

// Passenger submits feedback
router.post('/', feedbackController.submitFeedback);

// Admin gets all feedback
router.get('/', feedbackController.getAllFeedback);

module.exports = router; 