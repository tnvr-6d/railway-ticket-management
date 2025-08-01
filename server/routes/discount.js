const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discount');

// Get discounts by passenger (must come before /active to avoid conflicts)
router.get('/by-passenger', discountController.getDiscountsByPassenger);

// Get all discounts
router.get('/', discountController.getAllDiscounts);

// Get active discounts
router.get('/active', discountController.getActiveDiscounts);

// Create new discount
router.post('/', discountController.createDiscount);

// Validate discount code
router.post('/validate', discountController.validateDiscountCode);

// Apply discount to booking
router.post('/apply', discountController.applyDiscountToBooking);

// Update discount status
router.put('/:id/status', discountController.updateDiscountStatus);

// Delete discount
router.delete('/:id', discountController.deleteDiscount);

// Get discount usage statistics
router.get('/statistics/usage', discountController.getDiscountUsageStatistics);

module.exports = router; 