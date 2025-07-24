const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// Authentication
router.post("/login", adminController.login);

// Schedule Management Routes
router.get("/schedules", adminController.getAllSchedules);
router.get("/schedules/:id", adminController.getScheduleById);
router.post("/schedules", adminController.createSchedule);
router.put("/schedules/:id", adminController.updateSchedule);
router.delete("/schedules/:id", adminController.deleteSchedule);

// Train Management Routes
router.get("/trains", adminController.getAllTrains);
router.get("/trains/:id", adminController.getTrainById);
router.post("/trains", adminController.createTrain);
router.put("/trains/:id", adminController.updateTrain);
router.delete("/trains/:id", adminController.deleteTrain);

// Supporting Data Routes
router.get("/routes", adminController.getAllRoutes);
router.get("/stations", adminController.getAllStations);
router.get("/classes", adminController.getAllClasses);
router.get("/coaches", adminController.getAllCoaches);

// Seat Inventory Management Routes
router.get("/trains/:trainId/seats", adminController.getSeatInventoryByTrain);
router.get("/schedules/:scheduleId/seats", adminController.getSeatInventoryBySchedule);
router.post("/schedules/:scheduleId/seats", adminController.addSeatToSchedule);
router.put("/seats/:inventoryId/availability", adminController.updateSeatAvailability);
router.delete("/seats/:inventoryId", adminController.deleteSeat);
router.get("/trains/:trainId/schedules", adminController.getScheduleByTrain);

module.exports = router;