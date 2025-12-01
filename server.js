const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config(); // لتحميل المتغيرات البيئية من .env

// ===================================
// 1. استيراد الروابط (Routes)
// ===================================
const authRoutes = require('./src/routes/AuthRoutes');
const tripRoutes = require('./src/routes/TripRoutes');

const app = express();

// ===================================
// 2. تطبيق Middlewares العامة
// ===================================

// الحماية: إعداد HTTP Headers لتحسين الأمان (Cross-Site Scripting, إلخ)
app.use(helmet()); 

// السماح بالوصول من تطبيق Flutter (Cors)
app.use(cors()); 

// لقراءة بيانات JSON المرسلة في جسم الطلب (Body)
app.use(express.json()); 

// لقراءة البيانات من Form Data (إذا احتجنا رفع ملفات أو بيانات نموذجية)
app.use(express.urlencoded({ extended: true }));


// ===================================
// 3. ربط الـ Routes
// ===================================

// رابط التحقق والتسجيل: POST /api/auth/register, POST /api/auth/login
app.use('/api/auth', authRoutes); 

// رابط الرحلات: GET /api/trips, POST /api/trips (Admin)
app.use('/api/trips', tripRoutes);


// ===================================
// 4. رابط اختبار وصحة النظام (Health Check)
// ===================================
app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to Travelmate API",
        status: "OK",
        version: "1.0"
    });
});

// ===================================
// 5. تشغيل السيرفر
// ===================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});