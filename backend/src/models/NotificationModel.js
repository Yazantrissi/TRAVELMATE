const db = require('../config/db');

// 1. إنشاء إشعار جديد
exports.create = async (userId, title, message) => {
    await db.execute(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [userId, title, message]
    );
};

// 2. جلب إشعارات مستخدم معين
exports.getByUserId = async (userId) => {
    const [rows] = await db.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
    return rows;
};

// 3. تحديث الإشعار كـ "تمت القراءة"
exports.markAsRead = async (notificationId) => {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
};