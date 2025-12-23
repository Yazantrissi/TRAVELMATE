const db = require('../config/db');

// إضافة رحلة جديدة (Admin Only)
exports.create = async (title, description, price, start_date, end_date, location, transport_type, image_url, max_seats) => {
    try {
        const [result] = await db.execute(
            'INSERT INTO trips (title, description, price, start_date, end_date, location, transport_type, image_url, max_seats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, price, start_date, end_date, location, transport_type, image_url, max_seats]
        );
        return result.insertId;
    } catch (error) {
        throw new Error('Database Error: Could not create trip.');
    }
};

// جلب جميع الرحلات (Public)
exports.findAll = async () => {
    try {
        const [rows] = await db.execute('SELECT * FROM trips ORDER BY start_date ASC');
        return rows;
    } catch (error) {
        throw new Error('Database Error: Could not fetch all trips.');
    }
};

// جلب رحلة حسب ID (Public)
exports.findById = async (id) => {
    try {
        const [rows] = await db.execute('SELECT * FROM trips WHERE id = ?', [id]);
        return rows[0];
    } catch (error) {
        throw new Error('Database Error: Could not find trip.');
    }
};

// تحديث رحلة (Admin Only)
exports.update = async (id, title, description, price, start_date, end_date, location, transport_type, image_url, max_seats) => {
    try {
        const [result] = await db.execute(
            'UPDATE trips SET title=?, description=?, price=?, start_date=?, end_date=?, location=?, transport_type=?, image_url=?, max_seats=? WHERE id = ?',
            [title, description, price, start_date, end_date, location, transport_type, image_url, max_seats, id]
        );
        return result.affectedRows;
    } catch (error) {
        throw new Error('Database Error: Could not update trip.');
    }
};