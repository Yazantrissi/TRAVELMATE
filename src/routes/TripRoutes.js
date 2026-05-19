const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');
const auth = require('../middleware/auth'); // للتحقق من Token
const admin = require('../middleware/admin'); // للتحقق من صلاحية Admin

// ==============================================
// الروابط العامة (للمستخدم العادي - Client)
// ==============================================

// GET /api/trips: عرض جميع الرحلات (لا تتطلب تسجيل دخول)
router.get('/', TripController.getAllTrips);

// GET /api/trips/:id: عرض تفاصيل رحلة معينة (لا تتطلب تسجيل دخول)
router.get('/:id', TripController.getTripDetails);


// ==============================================
// روابط الإدارة (للـ Admin فقط)
// ==============================================
// تطبيق: auth (هل هو مسجل دخول؟) ثم admin (هل هو مدير؟)
// مثال: POST /api/trips
router.post('/', auth, admin, TripController.addTrip);

// مثال: PUT /api/trips/:id
router.put('/:id', auth, admin, TripController.updateTrip);

module.exports = router;