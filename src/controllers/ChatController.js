const db = require('../config/db');

// ─── Get/Create Trip Room ─────────────────────────────────
exports.getOrCreateRoom = async (req, res) => {
    try {
        const { tripId } = req.params;
        const [existing] = await db.execute(
            'SELECT id FROM chat_rooms WHERE trip_id = ?', [tripId]
        );
        let roomId;
        if (existing.length > 0) {
            roomId = existing[0].id;
        } else {
            const [result] = await db.execute(
                'INSERT INTO chat_rooms (trip_id, creator_id) VALUES (?, ?)',
                [tripId, req.user.id]
            );
            roomId = result.insertId;
        }
        res.json({ room_id: roomId });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Send Message (room) ──────────────────────────────────
exports.sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { message } = req.body;
        const [result] = await db.execute(
            'INSERT INTO chat_messages (room_id, user_id, message) VALUES (?, ?, ?)',
            [roomId, req.user.id, message]
        );
        res.json({ id: result.insertId, success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Get Messages (room) ──────────────────────────────────
exports.getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const [rows] = await db.execute(
            `SELECT m.id, m.room_id, m.user_id, u.username as sender_name,
                    m.message, m.created_at as sent_at
             FROM chat_messages m JOIN users u ON m.user_id = u.id
             WHERE m.room_id = ? ORDER BY m.created_at ASC LIMIT 100`,
            [roomId]
        );
        res.json({ messages: rows });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Search Users ─────────────────────────────────────────
exports.searchUsers = async (req, res) => {
    try {
        const q = req.query.q || '';
        const [users] = await db.execute(
            'SELECT id, username, email FROM users WHERE id != ? AND (username LIKE ? OR email LIKE ?) LIMIT 20',
            [req.user.id, `%${q}%`, `%${q}%`]
        );
        res.json({ users });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Create Group ─────────────────────────────────────────
exports.createGroup = async (req, res) => {
    try {
        const { name, member_ids } = req.body;
        if (!name || !member_ids || !member_ids.length)
            return res.status(400).json({ message: 'اسم المجموعة والأعضاء مطلوبون' });

        const [result] = await db.execute(
            'INSERT INTO chat_rooms (trip_id, creator_id, name) VALUES (NULL, ?, ?)',
            [req.user.id, name]
        );
        const roomId = result.insertId;

        const allMembers = [req.user.id, ...member_ids.filter(id => id !== req.user.id)];
        for (const uid of allMembers) {
            try {
                await db.execute(
                    'INSERT IGNORE INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
                    [roomId, uid]
                );
            } catch (e) {}
        }

        console.log('✅ Group created:', roomId);
        res.status(201).json({ message: 'تم إنشاء المجموعة', group_id: roomId });
    } catch (e) {
        console.error('createGroup Error:', e.message);
        res.status(500).json({ message: e.message });
    }
};

// ─── Get User Groups ──────────────────────────────────────
exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const [myGroups] = await db.execute(
            'SELECT id FROM chat_rooms WHERE creator_id = ?', [userId]
        );
        const [memberGroups] = await db.execute(
            'SELECT room_id as id FROM chat_room_members WHERE user_id = ?', [userId]
        );

        const ids = [...new Set([
            ...myGroups.map(r => r.id),
            ...memberGroups.map(r => r.id)
        ])];

        console.log('Groups IDs for user', userId, ':', ids);
        if (!ids.length) return res.json({ groups: [] });

        const placeholders = ids.map(() => '?').join(',');
        const [groups] = await db.execute(`
            SELECT r.id,
                   COALESCE(r.name, t.title, 'مجموعة') as name,
                   IF(r.trip_id IS NULL, 'private', 'trip') as type,
                   r.trip_id,
                   (SELECT message FROM chat_messages WHERE group_id = r.id ORDER BY sent_at DESC LIMIT 1) as last_message,
                   (SELECT COUNT(*) FROM chat_room_members WHERE room_id = r.id) as members_count
            FROM chat_rooms r
            LEFT JOIN trips t ON r.trip_id = t.id
            WHERE r.id IN (${placeholders})
            ORDER BY r.created_at DESC
        `, ids);

        console.log('Groups found:', groups.length);
        res.json({ groups });
    } catch (e) {
        console.error('getUserGroups Error:', e.message);
        res.status(500).json({ message: e.message });
    }
};

// ─── Get Group Messages ───────────────────────────────────
exports.getGroupMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT m.id, m.group_id, m.sender_id, u.username as sender_name,
                    m.message, m.sent_at
             FROM chat_messages m JOIN users u ON m.sender_id = u.id
             WHERE m.group_id = ? ORDER BY m.sent_at ASC LIMIT 100`,
            [id]
        );
        res.json({ messages: rows });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Send Group Message ───────────────────────────────────
exports.sendGroupMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ message: 'الرسالة فارغة' });

        const [result] = await db.execute(
            'INSERT INTO chat_messages (group_id, sender_id, message) VALUES (?, ?, ?)',
            [id, req.user.id, message.trim()]
        );
        res.status(201).json({ id: result.insertId, success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
