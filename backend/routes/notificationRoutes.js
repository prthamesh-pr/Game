// Mark notification as read
router.post('/:id/read', require('../controllers/notificationController').markAsRead);
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET all notifications
router.get('/', notificationController.getAllNotifications);

// POST send notification
router.post('/send', notificationController.sendNotification);

module.exports = router;
