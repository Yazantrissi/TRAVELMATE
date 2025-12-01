const jwt = require('jsonwebtoken');

// يجب تعيين سر التوقيع من ملف .env
const jwtSecret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    // 1. استخراج الـ Token من الـ Header
    // شكل الـ Header: Authorization: Bearer <TOKEN>
    const authHeader = req.header('Authorization');
    
    // التحقق من وجود الـ Header ووجود كلمة Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'الوصول مرفوض. لا يوجد رمز تحقق (Token).' });
    }

    // استخلاص الـ Token
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. التحقق من صحة الـ Token
        const decoded = jwt.verify(token, jwtSecret);
        
        // 3. إضافة بيانات المستخدم إلى طلب الـ Request
        // هذا يسهل الوصول إلى user.id و user.role في الـ Controller
        req.user = decoded; 
        
        // 4. الانتقال إلى الدالة التالية (الـ Controller)
        next();
    } catch (error) {
        // إذا كان الـ Token غير صالح أو منتهي الصلاحية
        res.status(401).json({ message: 'رمز التحقق (Token) غير صالح أو منتهي الصلاحية.' });
    }
};

module.exports = auth;