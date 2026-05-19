const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, BookingController.getUserBookings);
router.post('/group', auth, BookingController.initiateGroupBooking);

// compat: بعض الـ APIs قد تستخدم passengers كمفتاح different
// (لا تغيير هنا حالياً)
router.put('/:id/status', auth, admin, BookingController.updateBookingStatus);
router.post('/webhook', express.raw({ type: 'application/json' }), BookingController.handleStripeWebhook);

module.exports = router;
