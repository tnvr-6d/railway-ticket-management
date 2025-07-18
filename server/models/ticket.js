const pool = require('../db');

// ... (keep all other functions in the file as they are)

const getTicketsByPassenger = async (passenger_id) => {
  const query = `
    SELECT 
      t.ticket_id, t.status, t.seat_number, t.price, t.booking_date,
      s.departure_date, s.departure_time,
      si.class_type, si.coach_number,
      tr.train_name,
      st_src.station_name as source,
      st_dest.station_name as destination,
      -- ADDED: Subquery to aggregate intermediate station names into an array
      (SELECT ARRAY_AGG(st.station_name ORDER BY rs.departure_time)
         FROM route_station rs
         JOIN station st ON rs.station_id = st.station_id
         WHERE rs.route_id = r.route_id) AS intermediate_stations
    FROM ticket t
    JOIN schedule s ON t.schedule_id = s.schedule_id
    JOIN seat_inventory si ON t.schedule_id = si.schedule_id AND t.seat_number = si.seat_number
    JOIN train tr ON s.train_id = tr.train_id
    JOIN route r ON s.route_id = r.route_id
    JOIN station st_src ON r.source_station_id = st_src.station_id
    JOIN station st_dest ON r.destination_station_id = st_dest.station_id
    WHERE t.passenger_id = $1
    ORDER BY s.departure_date DESC, s.departure_time DESC;
  `;
  const { rows } = await pool.query(query, [passenger_id]);
  return rows;
};

// ... (make sure to export getTicketsByPassenger along with the other functions)
module.exports = {
  getTicketsByPassenger,
  // ... other exports
};

/*const getTicketsByPassenger = async (passenger_id) => {
  // The query is now a simple call to our new PL/pgSQL function.
  const query = 'SELECT * FROM get_passenger_tickets($1)';
  
  const { rows } = await pool.query(query, [passenger_id]);
  return rows;
};*/

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

const requestTicketCancellation = async (ticket_id, reason) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if the ticket exists and is booked
    const ticketRes = await client.query(
      "SELECT * FROM ticket WHERE ticket_id = $1 AND status = 'Booked'",
      [ticket_id]
    );
    if (ticketRes.rows.length === 0) {
      throw new Error("Ticket not found or cannot be cancelled.");
    }

    // Update ticket status
    await client.query(
      "UPDATE ticket SET status = 'Pending Cancellation' WHERE ticket_id = $1",
      [ticket_id]
    );

    // Find the associated booking_id from ticket_booking table
    const bookingLinkRes = await client.query(
        "SELECT booking_id FROM ticket_booking WHERE ticket_id = $1",
        [ticket_id]
    );
    if(bookingLinkRes.rows.length === 0) {
        throw new Error("Booking information not found for this ticket.");
    }
    const { booking_id } = bookingLinkRes.rows[0];

    // Add cancellation reason to the booking table
    await client.query(
      "UPDATE booking SET cancellation_reason = $1 WHERE booking_id = $2",
      [reason, booking_id]
    );
    
    // The seat remains unavailable during the pending period, so we don't touch seat_inventory.

    await client.query("COMMIT");
    return { success: true, message: "Cancellation request submitted successfully." };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in requestTicketCancellation:", error);
    throw error;
  } finally {
    client.release();
  }
};


/**
 * NEW: Get all tickets that are pending cancellation for the admin dashboard
 */
const getPendingCancellations = async () => {
    const query = `
        SELECT 
            t.ticket_id,
            t.status,
            t.seat_number,
            t.price,
            t.booking_date,
            b.cancellation_reason,
            p.name AS passenger_name,
            p.passenger_id,
            tr.train_name,
            s.departure_date,
            s.departure_time,
            st_src.station_name AS source,
            st_dest.station_name AS destination,
            si.class_type -- This line is important
        FROM ticket t
        JOIN passenger p ON t.passenger_id = p.passenger_id
        JOIN schedule s ON t.schedule_id = s.schedule_id
        JOIN train tr ON s.train_id = tr.train_id
        JOIN route r ON s.route_id = r.route_id
        JOIN station st_src ON r.source_station_id = st_src.station_id
        JOIN station st_dest ON r.destination_station_id = st_dest.station_id
        JOIN ticket_booking tb ON t.ticket_id = tb.ticket_id
        JOIN booking b ON tb.booking_id = b.booking_id
        JOIN seat_inventory si ON t.schedule_id = si.schedule_id AND t.seat_number = si.seat_number -- This JOIN is important
        WHERE t.status = 'Pending Cancellation'
        ORDER BY t.booking_date DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};
/**
 * NEW: Confirm a ticket cancellation (Admin action)
 * This function performs the final cancellation steps.
 */
const confirmCancellation = async (ticket_id, admin_id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        
        const safe_admin_id = parseInt(admin_id, 10);
        if (isNaN(safe_admin_id)) {
            throw new Error('Invalid Admin ID.');
        }

      
        await client.query(`SET LOCAL myapp.current_admin_id = ${safe_admin_id}`);
        
        //ADMIN TRIGGER
        const result = await client.query(
            "UPDATE ticket SET status = 'Cancelled' WHERE ticket_id = $1 AND status = 'Pending Cancellation'",
            [ticket_id]
        );

        if (result.rowCount === 0) {
            throw new Error('Ticket not found or is not pending cancellation.');
        }

        await client.query('COMMIT');
        return { success: true, message: 'Ticket cancellation confirmed and logged by trigger.' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in confirmCancellation (trigger mode):', error);
        throw error;
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
  getAvailableSeats,
  requestTicketCancellation, 
  getPendingCancellations, 
  confirmCancellation       
};
