const db = require('../config/db');

// Admin dashboard stats
exports.getStats = async () => {
  const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
  const [totalTrips] = await db.execute('SELECT COUNT(*) as count FROM trips');
  const [totalBookings] = await db.execute('SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"');
  const [revenue] = await db.execute('SELECT SUM(total_price) as total FROM bookings WHERE status = "confirmed"');

  return {
    totalUsers: totalUsers[0].count,
    totalTrips: totalTrips[0].count,
    confirmedBookings: totalBookings[0].count,
    totalRevenue: revenue[0].total || 0
  };
};

// Recent bookings
exports.getRecentBookings = async (limit = 10) => {
  const [rows] = await db.execute(`
    SELECT b.*, u.username, t.title 
    FROM bookings b 
    JOIN users u ON b.user_id = u.id 
    JOIN trips t ON b.trip_id = t.id 
    WHERE b.status = "confirmed"
    ORDER BY b.created_at DESC LIMIT ?
  `, [limit]);
  return rows;
};

// Trips availability (seats left)
exports.getTripsAvailability = async () => {
  const [rows] = await db.execute(`
    SELECT t.*, 
    (t.max_seats - COALESCE(SUM(b.passenger_count), 0)) as seats_left
    FROM trips t 
    LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = "confirmed"
    GROUP BY t.id
  `);
  return rows;
};

