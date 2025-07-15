const express = require("express");
const router = express.Router();
const passengerController = require("../controllers/passenger");

// Login route
router.post("/login", passengerController.loginPassenger);

// Optional: Add a test route to check if passenger exists
router.get("/check/:id", passengerController.checkPassenger);

module.exports = router;