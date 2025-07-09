const passengerModel = require("../models/passenger");
const UAParser = require('ua-parser-js'); // Import the new library

const loginPassenger = async (req, res) => {
  const { identifier, password_hash } = req.body;
  if (!identifier || !password_hash) {
    return res.status(400).json({ message: "Identifier and password are required." });
  }

  // --- MODIFICATION STARTS HERE ---

  // Get the IP address from the request. 'trust proxy' makes this more reliable.
  const ip_address = req.ip;

  // Parse the User-Agent header to get clean device info.
  const ua = UAParser(req.headers['user-agent']);
  const device_info = `${ua.browser.name || 'Unknown Browser'} on ${ua.os.name || 'Unknown OS'}`;

  // --- MODIFICATION ENDS HERE ---

  try {
    // Pass the new, cleaner info to the model.
    const result = await passengerModel.loginPassenger(identifier, password_hash, ip_address, device_info);
    res.json(result);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

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