const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/AuthRoutes');
const tripRoutes = require('./src/routes/TripRoutes');
const friendRoutes = require('./src/routes/FriendRoutes');
const bookingRoutes = require('./src/routes/BookingRoutes');
const notificationRoutes = require('./src/routes/NotificationRoutes');

const app = express();

// إعداد CORS للسماح لتطبيق Flutter بالاتصال
app.use(cors());

// ملاحظة هامة: الـ Webhook يحتاج لبيانات Raw قبل تحويلها لـ JSON
app.use('/api/bookings/webhook', express.raw({ type: 'application/json' }));

// بقية المسارات تستخدم JSON العادي
app.use(express.json());

// تعريف الروابط (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);

// اختبار السيرفر
app.get('/', (req, res) => {
    res.send('Travelmate API is running successfully...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});