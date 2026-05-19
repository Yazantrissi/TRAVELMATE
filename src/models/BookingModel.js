const db = require('../config/db');

exports.createBooking = async (userId, tripId, total_price, booking_type, stripe_id) => {
    const [result] = await db.execute(
        'INSERT INTO bookings (user_id, trip_id, total_price, booking_type, stripe_payment_id, status) VALUES (?, ?, ?, ?, ?, "pending")',
        [userId, tripId, total_price, booking_type, stripe_id]
    );
    return result.insertId;
};

exports.addPassengers = async (bookingId, passengers) => {
    const values = passengers.map(p => [bookingId, p.full_name, p.passport_number, p.age]);
    const [result] = await db.query(
        'INSERT INTO booking_passengers (booking_id, full_name, passport_number, age) VALUES ?',
        [values]
    );
    return result;
};

exports.updateStatus = async (stripeId, status) => {
    await db.execute('UPDATE bookings SET status = ? WHERE stripe_payment_id = ?', [status, stripeId]);
};

exports.updateStatusById = async (bookingId, status) => {
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
};
