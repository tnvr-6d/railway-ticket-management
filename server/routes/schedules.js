
const express = require("express");
const router = express.Router();
const scheduleController = require('../controllers/schedule');

// GET all schedules with robust LEFT JOINs
router.get("/", scheduleController.getAllSchedules);

// GET search results with robust LEFT JOINs
router.get("/search", scheduleController.searchSchedules);

module.exports = router;
