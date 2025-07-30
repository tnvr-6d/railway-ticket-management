const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');

// Create payment
router.post('/', paymentController.createPayment);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Update payment status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Get payments by passenger
router.get('/passenger/:passengerId', paymentController.getPaymentsByPassenger);

// Get payment statistics
router.get('/statistics/overview', paymentController.getPaymentStatistics);

// Get payments by date range
router.get('/statistics/range', paymentController.getPaymentsByDateRange);

module.exports = router; 