const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes         = require('./src/routes/AuthRoutes');
const tripRoutes         = require('./src/routes/TripRoutes');
const friendRoutes       = require('./src/routes/FriendRoutes');
const bookingRoutes      = require('./src/routes/BookingRoutes');
const notificationRoutes = require('./src/routes/NotificationRoutes');
const chatRoutes         = require('./src/routes/ChatRoutes');
const adminRoutes        = require('./src/routes/AdminRoutes');

const app = express();

app.use(cors());
app.use('/api/bookings/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── Dashboard ────────────────────────────────────────────
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/trips',         tripRoutes);
app.use('/api/friends',       friendRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/admin',         adminRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: '🚀 TravelMate API running',
        dashboard: 'http://localhost:3000/dashboard',
        endpoints: {
            auth:          ['POST /api/auth/register', 'POST /api/auth/login'],
            trips:         ['GET /api/trips', 'GET /api/trips/:id', 'POST /api/trips (admin)', 'PUT /api/trips/:id (admin)'],
            bookings:      ['GET /api/bookings', 'POST /api/bookings/group', 'PUT /api/bookings/:id/status (admin)'],
            notifications: ['GET /api/notifications/', 'PUT /api/notifications/:id/read'],
            chat:          ['GET /api/chat/rooms/:tripId', 'POST /api/chat/rooms/:roomId/messages'],
            admin:         ['GET /api/auth/stats', 'GET /api/auth/users', 'GET /api/auth/bookings-all']
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🎛️  Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📱 Android:   http://10.0.2.2:${PORT}/api/\n`);
});
