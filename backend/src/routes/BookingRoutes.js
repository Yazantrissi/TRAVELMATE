const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const auth = require('../middleware/auth');

// حماية الروابط بالـ Token
router.post('/group', auth, BookingController.initiateGroupBooking);

// ملاحظة: الـ Webhook يجب أن يكون Public لأن Stripe هو من يناديه
router.post('/webhook', express.raw({type: 'application/json'}), BookingController.handleStripeWebhook);

module.exports = router;