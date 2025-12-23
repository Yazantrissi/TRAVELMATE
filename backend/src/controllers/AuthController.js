const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

// تعيين سرية التوقيع من ملف .env
const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10; // عدد مرات التشفير

// ===================================
// 1. منطق التسجيل (Register)
// ===================================
exports.register = async (req, res) => {
    const { username, email, phone_number, password } = req.body;

    if (!username || !email || !phone_number || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة.' });
    }

    try {
        // أ. التحقق من وجود المستخدم مسبقاً (إيميل أو هاتف)
        const userExists = await UserModel.checkExistingUser(email, phone_number);
        if (userExists) {
            return res.status(409).json({ message: 'المستخدم أو رقم الهاتف مسجل بالفعل.' });
        }

        // ب. تشفير كلمة المرور (Hashing)
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ج. إنشاء المستخدم وحفظه في قاعدة البيانات
        const userId = await UserModel.create(username, email, phone_number, hashedPassword);

        res.status(201).json({
            message: 'تم تسجيل الحساب بنجاح.',
            userId: userId
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'حدث خطأ في عملية التسجيل.', error: error.message });
    }
};


// ===================================
// 2. منطق تسجيل الدخول (Login)
// ===================================
exports.login = async (req, res) => {
    const { identifier, password } = req.body; // identifier هو إما إيميل أو رقم هاتف

    try {
        // أ. البحث عن المستخدم في قاعدة البيانات
        const user = await UserModel.findByCredentials(identifier);

        if (!user) {
            return res.status(401).json({ message: 'البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        // ب. مقارنة كلمة المرور المشفرة
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        // ج. إنشاء رمز JWT (JSON Web Token)
        const token = jwt.sign(
            { id: user.id, role: user.role }, // البيانات المشفرة داخل الرمز
            jwtSecret,
            { expiresIn: '7d' } // صلاحية الرمز لمدة 7 أيام
        );

        // د. إرجاع الرمز وبيانات المستخدم (بدون كلمة المرور المشفرة)
        const { password_hash, ...userData } = user;
        res.status(200).json({
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'حدث خطأ في عملية تسجيل الدخول.' });
    }
};