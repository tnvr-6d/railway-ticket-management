const pool = require('../db');

const getAllDiscounts = async () => {
    const result = await pool.query(`
        SELECT 
            d.discount_id,
            d.code,
            d.discount_percentage,
            d.booking_id,
            d.passenger_id,
            d.used_at,
            di.processed_by,
            di.is_active,
            di.start_date,
            di.end_date
        FROM discount d
        LEFT JOIN discount_info di ON d.discount_id = di.discount_id
        ORDER BY d.discount_id
    `);
    return result.rows;
};

const getActiveDiscounts = async () => {
    const result = await pool.query(`
        SELECT 
            d.discount_id,
            d.code,
            d.discount_percentage,
            d.passenger_id,
            di.start_date,
            di.end_date
        FROM discount d
        JOIN discount_info di ON d.discount_id = di.discount_id
        WHERE di.is_active = true 
        AND CURRENT_DATE BETWEEN di.start_date AND di.end_date
        ORDER BY d.discount_id
    `);
    return result.rows;
};

const createDiscount = async (discountData) => {
    const { code, discount_percentage, passenger_id, processed_by } = discountData;
    
    // Start a transaction
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Insert into discount table
        const discountResult = await client.query(`
            INSERT INTO discount (code, discount_percentage, passenger_id)
            VALUES ($1, $2, $3)
            RETURNING discount_id
        `, [code, discount_percentage, passenger_id]);
        
        const discount_id = discountResult.rows[0].discount_id;
        
        // Insert into discount_info table
        await client.query(`
            INSERT INTO discount_info (discount_id, processed_by, is_active, start_date, end_date)
            VALUES ($1, $2, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year')
        `, [discount_id, processed_by]);
        
        await client.query('COMMIT');
        
        return { discount_id, code, discount_percentage, passenger_id };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const validateDiscountCode = async (code, passengerId) => {
    const result = await pool.query(`
        SELECT 
            d.discount_id,
            d.discount_percentage,
            di.is_active,
            di.start_date,
            di.end_date
        FROM discount d
        JOIN discount_info di ON d.discount_id = di.discount_id
        WHERE d.code = $1 
        AND d.passenger_id = $2
        AND di.is_active = true
        AND CURRENT_DATE BETWEEN di.start_date AND di.end_date
    `, [code, passengerId]);
    
    return result.rows[0];
};

const applyDiscountToBooking = async (discountId, bookingId, passengerId) => {
    const result = await pool.query(`
        UPDATE discount 
        SET booking_id = $1, used_at = CURRENT_TIMESTAMP
        WHERE discount_id = $2 AND passenger_id = $3
        RETURNING *
    `, [bookingId, discountId, passengerId]);
    
    return result.rows[0];
};

const updateDiscountStatus = async (discountId, isActive) => {
    const result = await pool.query(`
        UPDATE discount_info 
        SET is_active = $1
        WHERE discount_id = $2
        RETURNING *
    `, [isActive, discountId]);
    
    return result.rows[0];
};

const deleteDiscount = async (discountId) => {
    const result = await pool.query(`
        DELETE FROM discount 
        WHERE discount_id = $1 
        RETURNING *
    `, [discountId]);
    
    return result.rows[0];
};

const getDiscountUsageStatistics = async () => {
    const result = await pool.query(`
        SELECT 
            COUNT(*) as total_discounts,
            COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as used_discounts,
            COUNT(CASE WHEN used_at IS NULL THEN 1 END) as unused_discounts,
            AVG(discount_percentage) as avg_discount_percentage
        FROM discount
    `);
    
    return result.rows[0];
};

const getDiscountsByPassenger = async (passengerId) => {
    const result = await pool.query(`
        SELECT 
            d.discount_id,
            d.code,
            d.discount_percentage,
            d.passenger_id,
            d.used_at,
            di.is_active,
            di.start_date,
            di.end_date
        FROM discount d
        LEFT JOIN discount_info di ON d.discount_id = di.discount_id
        WHERE d.passenger_id = $1
        ORDER BY d.discount_id DESC
    `, [passengerId]);
    
    return result.rows;
};

module.exports = {
    getAllDiscounts,
    getActiveDiscounts,
    createDiscount,
    validateDiscountCode,
    applyDiscountToBooking,
    updateDiscountStatus,
    deleteDiscount,
    getDiscountUsageStatistics,
    getDiscountsByPassenger
}; 