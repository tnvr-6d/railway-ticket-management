const ticketModel = require('../models/ticket');

const getTicketsByPassenger = async (req, res) => {
  const { passenger_id } = req.query;

  if (!passenger_id) {
    return res.status(400).json({ error: "passenger_id is required" });
  }

  try {
    const tickets = await ticketModel.getTicketsByPassenger(passenger_id);
    res.json(tickets);
  } catch (err) {
    console.error("❌ Ticket fetch failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const bookTicket = async (req, res) => {
  const { passenger_id, schedule_id, seat_number } = req.body;
  
  if (!passenger_id || !schedule_id || !seat_number) {
    return res.status(400).json({ error: "passenger_id, schedule_id, and seat_number are required" });
  }

  try {
    const result = await ticketModel.bookTicket(passenger_id, schedule_id, seat_number);
    res.json(result);
  } catch (err) {
    console.error("❌ Booking failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const cancelTicket = async (req, res) => {
    const { ticket_id, reason = 'User requested cancellation' } = req.body;
    
    if (!ticket_id) {
        return res.status(400).json({ error: "ticket_id is required" });
    }

    try {
        const result = await ticketModel.cancelTicket(ticket_id, reason);
        res.json(result);
    } catch (err) {
        console.error("❌ Cancellation failed:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getAvailableSeats = async (req, res) => {
    const { schedule_id } = req.params;

    try {
        const seats = await ticketModel.getAvailableSeats(schedule_id);
        res.json(seats);
    } catch (err) {
        console.error("❌ Seats fetch failed:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
  getTicketsByPassenger,
  bookTicket,
  cancelTicket,
  getAvailableSeats,
};
