const pool = require('../db');

const createBooking = async (bookingData) => {
    const { passenger_id, payment_id, cancellation_reason = null } = bookingData;
    
    const result = await pool.query(`
        INSERT INTO booking (passenger_id, payment_id, cancellation_reason)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [passenger_id, payment_id, cancellation_reason]);
    
    return result.rows[0];
};

const getBookingById = async (bookingId) => {
    const result = await pool.query(`
        SELECT 
            b.*,
            p.name as passenger_name,
            p.email as passenger_email,
            p.phone_number as passenger_phone,
            pay.amount,
            pay.payment_status,
            pay.transaction_id
        FROM booking b
        JOIN passenger p ON b.passenger_id = p.passenger_id
        JOIN payment pay ON b.payment_id = pay.payment_id
        WHERE b.booking_id = $1
    `, [bookingId]);
    return result.rows[0];
};

const getBookingsByPassenger = async (passengerId) => {
    const result = await pool.query(`
        SELECT 
            b.*,
            pay.amount,
            pay.payment_status,
            pay.transaction_id,
            t.ticket_id,
            t.seat_number,
            t.price as ticket_price,
            t.status as ticket_status,
            s.departure_date,
            s.departure_time,
            tr.train_name,
            src.station_name as source,
            dest.station_name as destination
        FROM booking b
        JOIN payment pay ON b.payment_id = pay.payment_id
        JOIN ticket_booking tb ON b.booking_id = tb.booking_id
        JOIN ticket t ON tb.ticket_id = t.ticket_id
        JOIN schedule s ON t.schedule_id = s.schedule_id
        JOIN train tr ON s.train_id = tr.train_id
        JOIN route r ON s.route_id = r.route_id
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        WHERE b.passenger_id = $1
        ORDER BY b.booking_date DESC
    `, [passengerId]);
    return result.rows;
};

const updateBookingCancellationReason = async (bookingId, cancellationReason) => {
    const result = await pool.query(`
        UPDATE booking 
        SET cancellation_reason = $1
        WHERE booking_id = $2
        RETURNING *
    `, [cancellationReason, bookingId]);
    
    return result.rows[0];
};

const getBookingStatistics = async () => {
    const result = await pool.query(`
        SELECT 
            DATE(booking_date) as booking_date,
            COUNT(*) as total_bookings,
            SUM(pay.amount) as total_revenue
        FROM booking b
        JOIN payment pay ON b.payment_id = pay.payment_id
        WHERE pay.payment_status = 'Completed'
        GROUP BY DATE(booking_date)
        ORDER BY booking_date DESC
        LIMIT 30
    `);
    return result.rows;
};

const getCancelledBookings = async () => {
    const result = await pool.query(`
        SELECT 
            b.*,
            p.name as passenger_name,
            p.email as passenger_email,
            pay.amount,
            t.ticket_id,
            t.seat_number,
            s.departure_date,
            s.departure_time,
            tr.train_name,
            src.station_name as source,
            dest.station_name as destination
        FROM booking b
        JOIN passenger p ON b.passenger_id = p.passenger_id
        JOIN payment pay ON b.payment_id = pay.payment_id
        JOIN ticket_booking tb ON b.booking_id = tb.booking_id
        JOIN ticket t ON tb.ticket_id = t.ticket_id
        JOIN schedule s ON t.schedule_id = s.schedule_id
        JOIN train tr ON s.train_id = tr.train_id
        JOIN route r ON s.route_id = r.route_id
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        WHERE b.cancellation_reason IS NOT NULL
        ORDER BY b.booking_date DESC
    `);
    return result.rows;
};

module.exports = {
    createBooking,
    getBookingById,
    getBookingsByPassenger,
    updateBookingCancellationReason,
    getBookingStatistics,
    getCancelledBookings
}; 