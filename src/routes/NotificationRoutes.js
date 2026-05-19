const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const auth = require('../middleware/auth');

router.get('/', auth, NotificationController.getNotifications);
router.put('/:id/read', auth, NotificationController.readNotification);

module.exports = router;