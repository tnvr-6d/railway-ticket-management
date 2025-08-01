const paymentModel = require('../models/payment');

const createPayment = async (req, res) => {
    try {
        const { amount, transaction_id, payment_status } = req.body;
        
        if (!amount || !transaction_id) {
            return res.status(400).json({ success: false, message: "Amount and transaction ID are required" });
        }
        
        const payment = await paymentModel.createPayment({
            amount, transaction_id, payment_status
        });
        
        res.status(201).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentModel.getPaymentById(id);
        
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        
        res.json(payment);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: "Payment status is required" });
        }
        
        const payment = await paymentModel.updatePaymentStatus(id, status);
        
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        
        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPaymentsByPassenger = async (req, res) => {
    try {
        const { passengerId } = req.params;
        const payments = await paymentModel.getPaymentsByPassenger(passengerId);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPaymentStatistics = async (req, res) => {
    try {
        const statistics = await paymentModel.getPaymentStatistics();
        res.json(statistics);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPaymentsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Start date and end date are required" });
        }
        
        const payments = await paymentModel.getPaymentsByDateRange(startDate, endDate);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createPayment,
    getPaymentById,
    updatePaymentStatus,
    getPaymentsByPassenger,
    getPaymentStatistics,
    getPaymentsByDateRange
}; 