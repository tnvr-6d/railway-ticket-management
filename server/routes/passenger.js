const express = require("express");
const router = express.Router();
const passengerController = require("../controllers/passenger");

// Get all passengers with discount info
router.get("/", passengerController.getAllPassengers);

// Login route
router.post("/login", passengerController.loginPassenger);

// Register route
router.post("/register", passengerController.registerPassenger);

// Optional: Add a test route to check if passenger exists
router.get("/check/:id", passengerController.checkPassenger);

module.exports = router;