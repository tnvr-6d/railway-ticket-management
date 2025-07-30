const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coach');

// Get all coaches
router.get('/', coachController.getAllCoaches);

// Get coach by ID
router.get('/:id', coachController.getCoachById);

// Create new coach
router.post('/', coachController.createCoach);

// Update coach
router.put('/:id', coachController.updateCoach);

// Delete coach
router.delete('/:id', coachController.deleteCoach);

// Get coaches by class
router.get('/class/:classId', coachController.getCoachesByClass);

module.exports = router; 