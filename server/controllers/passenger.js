const passengerModel = require("../models/passenger");

const loginPassenger = async (req, res) => {
  // Use 'identifier' instead of 'passenger_id'
  const { identifier, password_hash } = req.body;
  if (!identifier || !password_hash) {
    return res.status(400).json({ message: "Identifier and password are required." });
  }

  try {
    const result = await passengerModel.loginPassenger(identifier, password_hash);
    res.json(result);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

// ... keep other controller functions if they exist

module.exports = {
    loginPassenger,
    // ... other exports
};

// ... keep other controller functions if they exist


const checkPassenger = async (req, res) => {
    try {
        const result = await passengerModel.checkPassenger(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    loginPassenger,
    checkPassenger,
};