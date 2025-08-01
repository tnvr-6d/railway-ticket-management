const discountModel = require('../models/discount');

const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await discountModel.getAllDiscounts();
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getActiveDiscounts = async (req, res) => {
    try {
        const discounts = await discountModel.getActiveDiscounts();
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createDiscount = async (req, res) => {
    try {
        const discountData = req.body;
        const discount = await discountModel.createDiscount(discountData);
        res.status(201).json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const validateDiscountCode = async (req, res) => {
    try {
        const { code, passengerId } = req.body;
        const discount = await discountModel.validateDiscountCode(code, passengerId);
        
        if (!discount) {
            return res.status(404).json({ success: false, message: "Invalid or expired discount code" });
        }
        
        res.json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const applyDiscountToBooking = async (req, res) => {
    try {
        const { discountId, bookingId, passengerId } = req.body;
        const discount = await discountModel.applyDiscountToBooking(discountId, bookingId, passengerId);
        res.json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateDiscountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const discount = await discountModel.updateDiscountStatus(id, isActive);
        res.json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await discountModel.deleteDiscount(id);
        
        if (!discount) {
            return res.status(404).json({ success: false, message: "Discount not found" });
        }
        
        res.json({ success: true, message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDiscountUsageStatistics = async (req, res) => {
    try {
        const statistics = await discountModel.getDiscountUsageStatistics();
        res.json(statistics);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDiscountsByPassenger = async (req, res) => {
    try {
        const passengerId = req.query.passenger_id || req.query.passengerId;
        
        if (!passengerId) {
            return res.status(400).json({ success: false, message: "Passenger ID is required" });
        }
        
        const discounts = await discountModel.getDiscountsByPassenger(passengerId);
        res.json({ success: true, discounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllDiscounts,
    getActiveDiscounts,
    createDiscount,
    validateDiscountCode,
    applyDiscountToBooking,
    updateDiscountStatus,
    deleteDiscount,
    getDiscountUsageStatistics,
    getDiscountsByPassenger
}; 