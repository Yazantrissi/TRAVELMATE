const db = require('../config/db');

// البحث عن مستخدم عبر البريد الإلكتروني أو رقم الهاتف
// لاستخدامه في عملية تسجيل الدخول
exports.findByCredentials = async (emailOrPhone) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, username, email, phone_number, password_hash, role FROM users WHERE email = ? OR phone_number = ?',
            [emailOrPhone, emailOrPhone]
        );
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

// إنشاء مستخدم جديد
exports.create = async (username, email, phone_number, password_hash) => {
    try {
        // عند التسجيل، الدور الافتراضي هو 'client'
        const [result] = await db.execute(
            'INSERT INTO users (username, email, phone_number, password_hash) VALUES (?, ?, ?, ?)',
            [username, email, phone_number, password_hash]
        );
        return result.insertId;
    } catch (error) {
        // إذا كان رقم الهاتف أو الإيميل مكرراً، سيتم إرجاع خطأ
        throw new Error(error.message);
    }
};

// التحقق من وجود مستخدم برقم الهاتف أو البريد قبل الإدراج
exports.checkExistingUser = async (email, phone_number) => {
    const [rows] = await db.execute(
        'SELECT id FROM users WHERE email = ? OR phone_number = ?',
        [email, phone_number]
    );
    return rows.length > 0;
};