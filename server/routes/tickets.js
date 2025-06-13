const express = require('express');
const router = express.Router();
const pool = require('../db'); // make sure this is at the top

// 👇 PASTE THIS NEW GET ROUTE HERE
router.get('/', async (req, res) => {
  const { passenger_id } = req.query;

  if (!passenger_id) {
    return res.status(400).json({ error: "passenger_id is required" });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM ticket WHERE passenger_id = $1 ORDER BY booking_date DESC
    `, [passenger_id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Your existing POST / route
router.post('/', async (req, res) => {
  const { passenger_id, schedule_id, seat_number, price, payment_method } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const paymentRes = await client.query(`
      INSERT INTO payment (amount, transaction_id, payment_status)
      VALUES ($1, $2, $3) RETURNING payment_id
    `, [price, `TXN-${Date.now()}`, 'Completed']);

    const payment_id = paymentRes.rows[0].payment_id;

    const ticketRes = await client.query(`
      INSERT INTO ticket (fair_id, passenger_id, schedule_id, seat_number, price, status, payment_method, payment_id)
      VALUES (1, $1, $2, $3, $4, 'Booked', $5, $6)
      RETURNING ticket_id
    `, [passenger_id, schedule_id, seat_number, price, payment_method, payment_id]);

    await client.query(`
      UPDATE seat_inventory SET is_available = false
      WHERE schedule_id = $1 AND seat_number = $2
    `, [schedule_id, seat_number]);

    await client.query('COMMIT');
    res.json({ ticket_id: ticketRes.rows[0].ticket_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ✅ Your existing POST /cancel route
router.post('/cancel', async (req, res) => {
  const { ticket_id, reason } = req.body;
  try {
    await pool.query(`
      UPDATE ticket SET status = 'Cancelled'
      WHERE ticket_id = $1
    `, [ticket_id]);

    await pool.query(`
      INSERT INTO ticket_cancellation (ticket_id, refund_amount, reason, processed_by)
      VALUES ($1, 0, $2, 1)
    `, [ticket_id, reason]);

    res.json({ message: 'Ticket cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
