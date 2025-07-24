const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'railway_db',
  password: 'your_password', // Replace with your actual password
  port: 5432,
});

async function addTestNotification() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add a test notification for passenger ID 62
    const notificationResult = await client.query(
      `INSERT INTO notification (status) VALUES ('Unread') RETURNING notification_id`
    );
    const notification_id = notificationResult.rows[0].notification_id;

    await client.query(
      `INSERT INTO notification_info (passenger_id, notification_id, message, type)
       VALUES ($1, $2, $3, $4)`,
      [62, notification_id, 'Test notification: Your ticket has been cancelled by an admin.', 'Ticket Cancellation']
    );

    await client.query('COMMIT');
    console.log('✅ Test notification added successfully for passenger ID 62');
    console.log('Notification ID:', notification_id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding test notification:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestNotification(); 