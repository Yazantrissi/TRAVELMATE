const db = require('../config/db');

// 1. البحث عن مستخدم برقم الهاتف (لإضافته كصديق)
exports.searchByPhone = async (phone_number) => {
    const [rows] = await db.execute(
        'SELECT id, username, phone_number FROM users WHERE phone_number = ?',
        [phone_number]
    );
    return rows[0];
};

// 2. إرسال طلب صداقة
exports.sendRequest = async (userId, friendId, category) => {
    const [result] = await db.execute(
        'INSERT INTO friendships (user_id, friend_id, status, category) VALUES (?, ?, "pending", ?)',
        [userId, friendId, category]
    );
    return result.insertId;
};

// 3. التحقق من وجود علاقة سابقة (لتجنب التكرار)
exports.checkExistingFriendship = async (userId, friendId) => {
    const [rows] = await db.execute(
        'SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [userId, friendId, friendId, userId]
    );
    return rows.length > 0;
};

// 4. جلب قائمة الأصدقاء المقبولين (مع بياناتهم)
exports.getFriendsList = async (userId) => {
    const query = `
        SELECT f.id as friendship_id, f.category, u.id as user_id, u.username, u.phone_number 
        FROM friendships f
        JOIN users u ON (f.friend_id = u.id OR f.user_id = u.id)
        WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = "accepted" 
        AND u.id != ?`;
    const [rows] = await db.execute(query, [userId, userId, userId]);
    return rows;
};

// 5. تحديث حالة الطلب (قبول أو رفض)
exports.updateStatus = async (requestId, status) => {
    const [result] = await db.execute(
        'UPDATE friendships SET status = ? WHERE id = ?',
        [status, requestId]
    );
    return result.affectedRows;
};