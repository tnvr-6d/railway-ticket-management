const pool = require('../db');

const getTicketsByPassenger = async (passengerId) => {
  const result = await pool.query(`
    SELECT 
      t.ticket_id,
      t.seat_number,
      t.price,
      t.status,
      t.booking_date,
      s.departure_date,
      s.departure_time,
      s.arrival_time,
      tr.train_name,
      st1.station_name AS source,
      st2.station_name AS destination,
      si.coach_number,
      si.class_type,
      b.booking_id,
      p.payment_id,
      p.amount as payment_amount,
      p.payment_status
    FROM ticket t
    JOIN schedule s ON t.schedule_id = s.schedule_id
    JOIN train tr ON s.train_id = tr.train_id
    JOIN route r ON s.route_id = r.route_id
    JOIN station st1 ON r.source_station_id = st1.station_id
    JOIN station st2 ON r.destination_station_id = st2.station_id
    JOIN seat_inventory si ON t.schedule_id = si.schedule_id AND t.seat_number = si.seat_number
    JOIN payment p ON t.payment_id = p.payment_id
    JOIN ticket_booking tb ON t.ticket_id = tb.ticket_id
    JOIN booking b ON tb.booking_id = b.booking_id
    WHERE t.passenger_id = $1
    ORDER BY t.ticket_id ASC
  `, [passengerId]);
  return result.rows;
};

const bookTicket = async (passenger_id, schedule_id, seat_number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seatCheck = await client.query(`
      SELECT si.*, r.distance, f.per_km_fare
      FROM seat_inventory si
      JOIN schedule s ON si.schedule_id = s.schedule_id
      JOIN route r ON s.route_id = r.route_id
      JOIN fare f ON si.coach_number = f.coach_number AND si.class_type = f.class_type
      WHERE si.schedule_id = $1 AND si.seat_number = $2 AND si.is_available = true
    `, [schedule_id, seat_number]);

    if (seatCheck.rows.length === 0) {
      throw new Error("Seat is not available or does not exist");
    }

    const seatInfo = seatCheck.rows[0];
    const ticketPrice = (seatInfo.distance * seatInfo.per_km_fare).toFixed(2);

    const paymentResult = await client.query(`
      INSERT INTO payment (amount, transaction_id, payment_status)
      VALUES ($1, $2, 'Completed')
      RETURNING payment_id
    `, [ticketPrice, `TXN-${Date.now()}-${passenger_id}`]);
    
    const payment_id = paymentResult.rows[0].payment_id;

    const bookingResult = await client.query(`
      INSERT INTO booking (passenger_id, payment_id)
      VALUES ($1, $2)
      RETURNING booking_id
    `, [passenger_id, payment_id]);
    
    const booking_id = bookingResult.rows[0].booking_id;

    const fareResult = await client.query(`
      SELECT fare_id FROM fare 
      WHERE coach_number = $1 AND class_type = $2
    `, [seatInfo.coach_number, seatInfo.class_type]);
    
    const fare_id = fareResult.rows[0].fare_id;

    const ticketResult = await client.query(`
      INSERT INTO ticket (
        fare_id, passenger_id, schedule_id, seat_number, 
        price, status, payment_id
      )
      VALUES ($1, $2, $3, $4, $5, 'Booked', $6)
      RETURNING ticket_id
    `, [fare_id, passenger_id, schedule_id, seat_number, ticketPrice, payment_id]);
    
    const ticket_id = ticketResult.rows[0].ticket_id;

    await client.query(`
      INSERT INTO ticket_booking (ticket_id, booking_id)
      VALUES ($1, $2)
    `, [ticket_id, booking_id]);

    await client.query(`
      UPDATE seat_inventory 
      SET is_available = false
      WHERE schedule_id = $1 AND seat_number = $2
    `, [schedule_id, seat_number]);

    await client.query('COMMIT');
    
    return { 
      success: true,
      ticket_id, 
      booking_id, 
      payment_id,
      price: ticketPrice,
      message: 'Ticket booked successfully' 
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const cancelTicket = async (ticket_id, reason) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ticketCheck = await client.query(`
            SELECT t.*, s.departure_date, s.departure_time
            FROM ticket t
            JOIN schedule s ON t.schedule_id = s.schedule_id
            WHERE t.ticket_id = $1 AND t.status = 'Booked'
        `, [ticket_id]);

        if (ticketCheck.rows.length === 0) {
            throw new Error("Ticket not found or already cancelled");
        }

        const ticket = ticketCheck.rows[0];
        
        const departureDateTime = new Date(`${ticket.departure_date} ${ticket.departure_time}`);
        const now = new Date();
        if (departureDateTime <= now) {
            throw new Error("Cannot cancel ticket for past or current journeys");
        }

        const refundAmount = parseFloat(ticket.price) * 0.8;

        await client.query(`
            UPDATE ticket 
            SET status = 'Cancelled'
            WHERE ticket_id = $1
        `, [ticket_id]);

        await client.query(`
            UPDATE seat_inventory 
            SET is_available = true
            WHERE schedule_id = $1 AND seat_number = $2
        `, [ticket.schedule_id, ticket.seat_number]);

        await client.query(`
            INSERT INTO ticket_cancellation (
                ticket_id, refund_amount, reason, processed_by, status
            )
            VALUES ($1, $2, $3, 1, 'Processed')
        `, [ticket_id, refundAmount, reason]);

        await client.query(`
            UPDATE payment 
            SET payment_status = 'Refunded'
            WHERE payment_id = $1
        `, [ticket.payment_id]);

        await client.query('COMMIT');
        
        return { 
            success: true,
            message: 'Ticket cancelled successfully',
            refund_amount: refundAmount,
            ticket_id: ticket_id
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getAvailableSeats = async (schedule_id) => {
    const result = await pool.query(`
        SELECT 
            si.*,
            c.coach_number,
            cl.class_type,
            f.per_km_fare,
            r.distance
        FROM seat_inventory si
        JOIN coach c ON si.coach_number = c.coach_number
        JOIN class cl ON si.class_type = cl.class_type
        JOIN schedule s ON si.schedule_id = s.schedule_id
        JOIN route r ON s.route_id = r.route_id
        JOIN fare f ON si.coach_number = f.coach_number AND si.class_type = f.class_type
        WHERE si.schedule_id = $1
        ORDER BY si.coach_number, si.seat_number
    `, [schedule_id]);

    const seats = result.rows.map(seat => ({
        ...seat,
        price: (seat.distance * seat.per_km_fare).toFixed(2)
    }));

    return seats;
};


module.exports = {
  getTicketsByPassenger,
  bookTicket,
  cancelTicket,
  getAvailableSeats,
};
