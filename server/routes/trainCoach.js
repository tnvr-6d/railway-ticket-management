const express = require('express');
const router = express.Router();
const trainCoachController = require('../controllers/trainCoach');

// Get train coaches
router.get('/train/:trainId', trainCoachController.getTrainCoaches);

// Get train composition
router.get('/composition/:trainId', trainCoachController.getTrainComposition);

// Assign coach to train
router.post('/train/:trainId', trainCoachController.assignCoachToTrain);

// Update coach order
router.put('/:trainCoachId', trainCoachController.updateCoachOrder);

// Remove coach from train
router.delete('/:trainCoachId', trainCoachController.removeCoachFromTrain);

module.exports = router; 