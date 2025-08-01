const pool = require('../db');

const createPayment = async (paymentData) => {
    const { amount, transaction_id, payment_status = 'Completed' } = paymentData;
    
    const result = await pool.query(`
        INSERT INTO payment (amount, transaction_id, payment_status)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [amount, transaction_id, payment_status]);
    
    return result.rows[0];
};

const getPaymentById = async (paymentId) => {
    const result = await pool.query(`
        SELECT * FROM payment WHERE payment_id = $1
    `, [paymentId]);
    return result.rows[0];
};

const updatePaymentStatus = async (paymentId, status) => {
    const result = await pool.query(`
        UPDATE payment 
        SET payment_status = $1
        WHERE payment_id = $2
        RETURNING *
    `, [status, paymentId]);
    
    return result.rows[0];
};

const getPaymentsByPassenger = async (passengerId) => {
    const result = await pool.query(`
        SELECT 
            p.*,
            t.ticket_id,
            t.seat_number,
            t.price as ticket_price,
            s.departure_date,
            s.departure_time,
            tr.train_name,
            src.station_name as source,
            dest.station_name as destination
        FROM payment p
        JOIN ticket t ON p.payment_id = t.payment_id
        JOIN schedule s ON t.schedule_id = s.schedule_id
        JOIN train tr ON s.train_id = tr.train_id
        JOIN route r ON s.route_id = r.route_id
        JOIN station src ON r.source_station_id = src.station_id
        JOIN station dest ON r.destination_station_id = dest.station_id
        WHERE t.passenger_id = $1
        ORDER BY p.payment_date DESC
    `, [passengerId]);
    return result.rows;
};

const getPaymentStatistics = async () => {
    const result = await pool.query(`
        SELECT 
            payment_status,
            COUNT(*) as count,
            SUM(amount) as total_amount
        FROM payment
        GROUP BY payment_status
    `);
    return result.rows;
};

const getPaymentsByDateRange = async (startDate, endDate) => {
    const result = await pool.query(`
        SELECT 
            p.*,
            t.ticket_id,
            t.seat_number,
            pass.name as passenger_name,
            pass.email as passenger_email,
            tr.train_name,
            s.departure_date,
            s.departure_time
        FROM payment p
        JOIN ticket t ON p.payment_id = t.payment_id
        JOIN passenger pass ON t.passenger_id = pass.passenger_id
        JOIN schedule s ON t.schedule_id = s.schedule_id
        JOIN train tr ON s.train_id = tr.train_id
        WHERE p.payment_date BETWEEN $1 AND $2
        ORDER BY p.payment_date DESC
    `, [startDate, endDate]);
    return result.rows;
};

module.exports = {
    createPayment,
    getPaymentById,
    updatePaymentStatus,
    getPaymentsByPassenger,
    getPaymentStatistics,
    getPaymentsByDateRange
}; 