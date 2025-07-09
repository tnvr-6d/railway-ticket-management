const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket');

// Existing routes
router.get('/', ticketController.getTicketsByPassenger);
router.post('/', ticketController.bookTicket);
router.get('/seats/:schedule_id', ticketController.getAvailableSeats);

// Modified and new routes for cancellation flow
router.post('/request-cancellation', ticketController.requestCancellation); // For passengers
router.get('/pending-cancellations', ticketController.getPendingCancellations); // For admins
router.post('/confirm-cancellation', ticketController.confirmCancellation); // For admins


module.exports = router;