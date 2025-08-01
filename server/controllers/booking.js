const bookingModel = require('../models/booking');

const createBooking = async (req, res) => {
    try {
        const { passenger_id, payment_id, cancellation_reason } = req.body;
        
        if (!passenger_id || !payment_id) {
            return res.status(400).json({ success: false, message: "Passenger ID and payment ID are required" });
        }
        
        const booking = await bookingModel.createBooking({
            passenger_id, payment_id, cancellation_reason
        });
        
        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await bookingModel.getBookingById(id);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingsByPassenger = async (req, res) => {
    try {
        const { passengerId } = req.params;
        const bookings = await bookingModel.getBookingsByPassenger(passengerId);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingCancellationReason = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellation_reason } = req.body;
        
        if (!cancellation_reason) {
            return res.status(400).json({ success: false, message: "Cancellation reason is required" });
        }
        
        const booking = await bookingModel.updateBookingCancellationReason(id, cancellation_reason);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingStatistics = async (req, res) => {
    try {
        const statistics = await bookingModel.getBookingStatistics();
        res.json(statistics);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCancelledBookings = async (req, res) => {
    try {
        const bookings = await bookingModel.getCancelledBookings();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBooking,
    getBookingById,
    getBookingsByPassenger,
    updateBookingCancellationReason,
    getBookingStatistics,
    getCancelledBookings
}; 