const passengerModel = require("../models/passenger");
const UAParser = require('ua-parser-js');

const loginPassenger = async (req, res) => {
  // Now expects 'email' instead of 'identifier'
  const { email, password_hash } = req.body;
  if (!email || !password_hash) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const ip_address = req.ip;
  const ua = UAParser(req.headers['user-agent']);
  const device_info = `${ua.browser.name || 'Unknown Browser'} on ${ua.os.name || 'Unknown OS'}`;

  try {
    const result = await passengerModel.loginPassenger(email, password_hash, ip_address, device_info);
    res.json(result);
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

const registerPassenger = async (req, res) => {
  const { passengerName, passengerEmail, passengerPassword, passengerPhone, passengerAddress } = req.body;

    if (!passengerName || !passengerEmail || !passengerPassword || !passengerPhone || !passengerAddress) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const result = await passengerModel.registerPassenger(passengerName, passengerEmail, passengerPassword, passengerPhone, passengerAddress);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    registerPassenger,
    checkPassenger,
};