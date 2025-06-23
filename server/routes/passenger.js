const express = require("express");
const router = express.Router();
const pool = require("../db");

// Login route
router.post("/login", async (req, res) => {
  const { passenger_id, password_hash } = req.body;
  
  // Add logging for debugging
  console.log("Login attempt:", { passenger_id, password_provided: !!password_hash });

  // Validate input
  if (!passenger_id || !password_hash) {
    return res.status(400).json({ 
      success: false, 
      message: "Passenger ID and password are required" 
    });
  }

  try {
    const result = await pool.query(
      `SELECT passenger_id, name, email FROM passenger WHERE passenger_id = $1 AND password_hash = $2`,
      [passenger_id, password_hash]
    );

    console.log("Database query result:", result.rows.length + " rows found");

    if (result.rows.length === 1) {
      res.json({ 
        success: true, 
        user: result.rows[0],
        message: "Login successful"
      });
    } else {
      // Check if passenger exists at all
      const passengerCheck = await pool.query(
        `SELECT passenger_id FROM passenger WHERE passenger_id = $1`,
        [passenger_id]
      );
      
      if (passengerCheck.rows.length === 0) {
        res.status(401).json({ 
          success: false, 
          message: "Passenger ID not found" 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid password" 
        });
      }
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      success: false,
      error: "Database connection error",
      message: "Unable to process login request"
    });
  }
});

// Optional: Add a test route to check if passenger exists
router.get("/check/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT passenger_id, name, email FROM passenger WHERE passenger_id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length > 0) {
      res.json({ exists: true, passenger: result.rows[0] });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
