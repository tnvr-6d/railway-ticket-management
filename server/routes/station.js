const express = require('express');
const router = express.Router();
const stationController = require('../controllers/station');

// Endpoint for station autocomplete search
router.get('/search', stationController.handleSearchStations);

module.exports = router;