const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// استيراد الروابط
const authRoutes = require('./src/routes/AuthRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json()); // لقراءة بيانات JSON القادمة من Flutter

// ===================================
// استخدام الروابط
// ===================================
app.use('/api/auth', authRoutes); // ربط روابط التحقق بالمسار الأساسي /api/auth

// Test Route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Travelmate API" });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});