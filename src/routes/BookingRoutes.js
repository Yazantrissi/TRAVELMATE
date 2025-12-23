const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const auth = require('../middleware/auth');

// حماية الروابط بالـ Token
router.post('/group', auth, BookingController.initiateGroupBooking);

module.exports = router;