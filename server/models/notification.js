const pool = require('../db');

const createNotification = async (passenger_id, message, type) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const notificationResult = await client.query(
            `INSERT INTO notification (status) VALUES ('Unread') RETURNING notification_id`
        );
        const notification_id = notificationResult.rows[0].notification_id;

        await client.query(
            `INSERT INTO notification_info (passenger_id, notification_id, message, type)
             VALUES ($1, $2, $3, $4)`,
            [passenger_id, notification_id, message, type]
        );

        await client.query('COMMIT');
        return { success: true, message: 'Notification created successfully.' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating notification:', error);
        throw error;
    } finally {
        client.release();
    }
};

const getNotificationsByPassengerId = async (passenger_id) => {
    try {
        const query = `
            SELECT 
                n.notification_id,
                n.status,
                n.created_at,
                ni.message,
                ni.type
            FROM notification n
            JOIN notification_info ni ON n.notification_id = ni.notification_id
            WHERE ni.passenger_id = $1
            ORDER BY n.created_at DESC
        `;
        const { rows } = await pool.query(query, [passenger_id]);
        return rows;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

const markNotificationAsRead = async (notification_id) => {
    try {
        const query = `
            UPDATE notification 
            SET status = 'Read' 
            WHERE notification_id = $1
        `;
        await pool.query(query, [notification_id]);
        return { success: true, message: 'Notification marked as read.' };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

const getUnreadNotificationCount = async (passenger_id) => {
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM notification n
            JOIN notification_info ni ON n.notification_id = ni.notification_id
            WHERE ni.passenger_id = $1 AND n.status = 'Unread'
        `;
        const { rows } = await pool.query(query, [passenger_id]);
        return rows[0].count;
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getNotificationsByPassengerId,
    markNotificationAsRead,
    getUnreadNotificationCount
};
