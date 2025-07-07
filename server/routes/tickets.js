const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket');

router.get('/', ticketController.getTicketsByPassenger);
router.post('/', ticketController.bookTicket);
router.post('/cancel', ticketController.cancelTicket);
router.get('/seats/:schedule_id', ticketController.getAvailableSeats);

module.exports = router;