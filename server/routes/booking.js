const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking');

// Create booking
router.post('/', bookingController.createBooking);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Get bookings by passenger
router.get('/passenger/:passengerId', bookingController.getBookingsByPassenger);

// Update booking cancellation reason
router.put('/:id/cancellation', bookingController.updateBookingCancellationReason);

// Get booking statistics
router.get('/statistics/overview', bookingController.getBookingStatistics);

// Get cancelled bookings
router.get('/statistics/cancelled', bookingController.getCancelledBookings);

module.exports = router; 