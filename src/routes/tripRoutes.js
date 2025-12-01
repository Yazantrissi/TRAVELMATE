// في ملف src/routes/TripRoutes.js

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const TripController = require('../controllers/TripController');

// 1. رابط عرض الرحلات للجميع (لا يتطلب Token)
router.get('/trips', TripController.getAllTrips);

// 2. رابط حجز رحلة (يتطلب Token صالح)
router.post('/bookings', auth, TripController.createBooking);

// 3. رابط إضافة رحلة جديدة (يتطلب Token صالح + صلاحية Admin)
router.post('/admin/trips', auth, admin, TripController.addTrip);