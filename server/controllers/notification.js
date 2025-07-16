const notificationModel = require('../models/notification');

const getNotifications = async (req, res) => {
    const { passenger_id } = req.query;
    if (!passenger_id) {
        return res.status(400).json({ error: "passenger_id is required" });
    }
    try {
        const notifications = await notificationModel.getNotificationsByPassengerId(passenger_id);
        res.json(notifications);
    } catch (err) {
        console.error("❌ Fetching notifications failed:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const markAsRead = async (req, res) => {
    const { notification_id } = req.body;
    if (!notification_id) {
        return res.status(400).json({ error: "notification_id is required" });
    }
    try {
        const result = await notificationModel.markNotificationAsRead(notification_id);
        res.json(result);
    } catch (err) {
        console.error("❌ Marking notification as read failed:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const getUnreadCount = async (req, res) => {
    const { passenger_id } = req.query;
    if (!passenger_id) {
        return res.status(400).json({ error: "passenger_id is required" });
    }
    try {
        const count = await notificationModel.getUnreadNotificationCount(passenger_id);
        res.json({ count: parseInt(count) });
    } catch (err) {
        console.error("❌ Fetching unread count failed:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    getUnreadCount
}; 