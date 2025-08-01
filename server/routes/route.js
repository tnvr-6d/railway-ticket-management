const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route');

// Get all routes
router.get('/', routeController.getAllRoutes);

// Get route by ID
router.get('/:id', routeController.getRouteById);

// Create new route
router.post('/', routeController.createRoute);

// Update route
router.put('/:id', routeController.updateRoute);

// Delete route
router.delete('/:id', routeController.deleteRoute);

// Get route stations
router.get('/:routeId/stations', routeController.getRouteStations);

// Add station to route
router.post('/:routeId/stations', routeController.addStationToRoute);

// Remove station from route
router.delete('/stations/:routeStationId', routeController.removeStationFromRoute);

module.exports = router; 