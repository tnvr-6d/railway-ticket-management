const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seat');

router.get('/', seatController.getSeatsBySchedule);

module.exports = router;
