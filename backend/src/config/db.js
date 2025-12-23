const mysql = require('mysql2');
require('dotenv').config(); // تحميل المتغيرات من ملف .env

// 1. إنشاء الـ Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travelmate_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. تعريف المتغير db وتحويله ليدعم الـ Promises
// هذا السطر يجب أن يكون قبل محاولة استخدام db.getConnection()
const db = pool.promise();

// 3. اختبار الاتصال الآن بعد أن أصبح db معرفاً
db.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL Database successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// 4. تصدير المتغير ليستخدم في الـ Models
module.exports = db;