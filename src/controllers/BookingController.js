const BookingModel = require('../models/BookingModel');
const TripModel = require('../models/TripModel');
const NotificationModel = require('../models/NotificationModel');
const db = require('../config/db');

let stripe = null;
try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && !key.includes('your_stripe') && key.startsWith('sk_')) {
        stripe = require('stripe')(key);
    }
} catch (e) {}

// ─── POST /api/bookings/group ──────────────────────────────
exports.initiateGroupBooking = async (req, res) => {
    console.log('=== BOOKING REQUEST ===');
    console.log('Body:', JSON.stringify(req.body));

    const { trip_id, passengers } = req.body;
    const user_id = req.user.id;

    try {
        if (!trip_id) return res.status(400).json({ message: 'trip_id مطلوب' });
        if (!passengers || !Array.isArray(passengers) || passengers.length === 0)
            return res.status(400).json({ message: 'يجب إضافة مسافر واحد على الأقل' });

        const trip = await TripModel.findById(trip_id);
        if (!trip) return res.status(404).json({ message: 'الرحلة غير موجودة' });

        const totalPrice = trip.price * passengers.length;

        if (!stripe) {
            // وضع الاختبار بدون Stripe
            const bookingId = await BookingModel.createBooking(user_id, trip_id, totalPrice, 'group', 'TEST_' + Date.now());

            // passengers قد يأتي كـ array من objects أو array أرقام (حسب Postman).
            // إذا كان رقم/string => نحوله لـ object بالقيم الافتراضية.
            const normalizedPassengers = passengers.map((p, idx) => {
                if (p && typeof p === 'object') return p;
                // لو كان الرقم مجرد index/seat
                return {
                    full_name: `Passenger ${idx + 1}`,
                    passport_number: `P-${String(p)}`,
                    age: 30
                };
            });

            await BookingModel.addPassengers(bookingId, normalizedPassengers);


            await NotificationModel.create(user_id,
                '🎉 تم استلام طلب حجزك',
                `طلب حجزك لرحلة "${trip.title}" إلى ${trip.location} قيد المراجعة. الإجمالي: $${totalPrice}`
            );

            console.log('✅ Booking created:', bookingId);
            return res.status(200).json({ message: 'تم إرسال طلب الحجز', bookingId, totalPrice, status: 'pending' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100), currency: 'usd',
            metadata: { user_id: user_id.toString(), trip_id: trip_id.toString() }
        });
        const bookingId = await BookingModel.createBooking(user_id, trip_id, totalPrice, 'group', paymentIntent.id);
        await BookingModel.addPassengers(bookingId, passengers);
        res.status(200).json({ clientSecret: paymentIntent.client_secret, bookingId, totalPrice });
    } catch (error) {
        console.error('❌ Booking Error:', error.message);
        res.status(500).json({ message: 'فشل الحجز', error: error.message });
    }
};

// ─── GET /api/bookings — حجوزات المستخدم ──────────────────
exports.getUserBookings = async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT b.id, b.trip_id, b.total_price, b.status, b.booking_date AS created_at,
                   t.title AS trip_title, t.location AS trip_location,
                   t.image_url AS trip_image, t.start_date, t.end_date,
                   (SELECT COUNT(*) FROM booking_passengers WHERE booking_id = b.id) AS members_count
            FROM bookings b JOIN trips t ON b.trip_id = t.id
            WHERE b.user_id = ? ORDER BY b.booking_date DESC
        `, [req.user.id]);
        res.json({ bookings });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── PUT /api/bookings/:id/status — Admin ──────────────────
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['confirmed', 'cancelled', 'ready', 'pending'];
        if (!allowed.includes(status)) return res.status(400).json({ message: 'حالة غير صالحة' });

        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        const [[booking]] = await db.execute(
            'SELECT b.user_id, t.title, t.location, b.total_price FROM bookings b JOIN trips t ON b.trip_id = t.id WHERE b.id = ?', [id]
        );

        if (booking) {
            const msgs = {
                confirmed: [`✅ تم تأكيد حجزك!`, `تم تأكيد حجزك لرحلة "${booking.title}" إلى ${booking.location}. المبلغ: $${booking.total_price}`],
                cancelled: [`❌ تم إلغاء الحجز`, `تم إلغاء حجزك لرحلة "${booking.title}".`],
                ready:     [`🎒 رحلتك جاهزة!`, `رحلتك إلى ${booking.location} جاهزة للمغادرة!`]
            };
            if (msgs[status]) await NotificationModel.create(booking.user_id, msgs[status][0], msgs[status][1]);
        }
        res.json({ message: 'تم تحديث الحالة', status });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ─── Stripe Webhook ────────────────────────────────────────
exports.handleStripeWebhook = async (req, res) => {
    if (!stripe) return res.status(200).json({ received: true });
    const sig = req.headers['stripe-signature'];
    let event;
    try { event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET); }
    catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }
    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        await BookingModel.updateStatus(pi.id, 'confirmed');
        await NotificationModel.create(pi.metadata.user_id, '✅ تم تأكيد الحجز', 'تم الدفع بنجاح وتأكيد حجزك.');
    }
    res.json({ received: true });
};
