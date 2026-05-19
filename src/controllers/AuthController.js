const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ─── Register ─────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { username, email, phone_number, password } = req.body;
        if (!username || !email || !password || !phone_number)
            return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

        const userExists = await UserModel.checkExistingUser(email, phone_number);
        if (userExists)
            return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = await UserModel.create(username, email, phone_number, hashedPassword);

        // ✅ إرجاع token بعد التسجيل مباشرة
        const token = jwt.sign(
            { id: userId, username, role: 'client' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', token, user: { id: userId, username, email, role: 'client' } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Login ─────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        console.log('Login Attempt:', req.body);
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });

        const user = await UserModel.findByCredentials(email);
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
};

// ─── Dashboard: Stats ─────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [[{ total_users }]]     = await db.execute('SELECT COUNT(*) as total_users FROM users');
        const [[{ total_trips }]]     = await db.execute('SELECT COUNT(*) as total_trips FROM trips');
        const [[{ total_bookings }]]  = await db.execute('SELECT COUNT(*) as total_bookings FROM bookings');
        const [[{ confirmed_bookings }]] = await db.execute('SELECT COUNT(*) as confirmed_bookings FROM bookings WHERE status="confirmed"');
        const [[{ total_revenue }]]   = await db.execute('SELECT COALESCE(SUM(total_price),0) as total_revenue FROM bookings WHERE status="confirmed"');
        res.json({ total_users, total_trips, total_bookings, confirmed_bookings, total_revenue });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Dashboard: All Bookings ──────────────────────────────
exports.getAllBookings = async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT b.id, b.total_price, b.status, b.created_at,
                   u.username, u.email, t.title as trip_title, t.location
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN trips t ON b.trip_id = t.id
            ORDER BY b.created_at DESC LIMIT 100
        `);
        res.json({ bookings });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Dashboard: All Users ─────────────────────────────────
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, phone_number, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Dashboard: Add User ──────────────────────────────────
exports.addUser = async (req, res) => {
    try {
        const { username, email, phone_number, password, role } = req.body;
        if (!username || !email || !phone_number || !password)
            return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

        const exists = await UserModel.checkExistingUser(email, phone_number);
        if (exists) return res.status(400).json({ message: 'الإيميل أو الهاتف موجود مسبقاً' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, phone_number, hash, role || 'client']
        );
        res.status(201).json({ message: 'تم إنشاء المستخدم', id: result.insertId });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Dashboard: Update User ───────────────────────────────
exports.updateUser = async (req, res) => {
    try {
        const { username, email, phone_number, role, password } = req.body;
        const { id } = req.params;
        if (password && password.length >= 6) {
            const hash = await bcrypt.hash(password, 10);
            await db.execute(
                'UPDATE users SET username=?, email=?, phone_number=?, role=?, password_hash=? WHERE id=?',
                [username, email, phone_number, role, hash, id]
            );
        } else {
            await db.execute(
                'UPDATE users SET username=?, email=?, phone_number=?, role=? WHERE id=?',
                [username, email, phone_number, role, id]
            );
        }
        res.json({ message: 'تم تحديث المستخدم' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Dashboard: Delete User ───────────────────────────────
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id)
            return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'تم حذف المستخدم' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
