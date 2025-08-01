const passengerModel = require('../models/passenger');
const UAParser = require('ua-parser-js');

const getAllPassengers = async (req, res) => {
    try {
        const passengers = await passengerModel.getAllPassengersWithDiscounts();
        res.json(passengers);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPassengerById = async (req, res) => {
    try {
        const { id } = req.params;
        const passenger = await passengerModel.getPassengerById(id);
        
        if (!passenger) {
            return res.status(404).json({ success: false, message: "Passenger not found" });
        }
        
        res.json(passenger);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createPassenger = async (req, res) => {
    try {
        const passengerData = req.body;
        const passenger = await passengerModel.createPassenger(passengerData);
        res.status(201).json({ success: true, passenger });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePassenger = async (req, res) => {
    try {
        const { id } = req.params;
        const passengerData = req.body;
        const passenger = await passengerModel.updatePassenger(id, passengerData);
        
        if (!passenger) {
            return res.status(404).json({ success: false, message: "Passenger not found" });
        }
        
        res.json({ success: true, passenger });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletePassenger = async (req, res) => {
    try {
        const { id } = req.params;
        const passenger = await passengerModel.deletePassenger(id);
        
        if (!passenger) {
            return res.status(404).json({ success: false, message: "Passenger not found" });
        }
        
        res.json({ success: true, message: "Passenger deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Existing functions
const loginPassenger = async (req, res) => {
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
    getAllPassengers,
    getPassengerById,
    createPassenger,
    updatePassenger,
    deletePassenger,
    loginPassenger,
    registerPassenger,
    checkPassenger
};