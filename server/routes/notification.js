const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');

// Get notifications for a passenger
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.post('/mark-read', notificationController.markAsRead);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router; 