const admin = (req, res, next) => {
    // يجب أن يكون الـ Auth Middleware قد عمل قبله، ليضيف req.user
    if (!req.user || req.user.role !== 'admin') {
        // 403 Forbidden: ليس لديه الصلاحية اللازمة
        return res.status(403).json({ message: 'الوصول مرفوض. تحتاج إلى صلاحيات المدير (Admin).' });
    }
    
    // إذا كان المدير: استمر في تنفيذ الطلب
    next();
};

module.exports = admin;