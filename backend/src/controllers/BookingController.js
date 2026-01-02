const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BookingModel = require('../models/BookingModel');
const TripModel = require('../models/TripModel');
const NotificationModel = require('../models/NotificationModel');

exports.initiateGroupBooking = async (req, res) => {
    const { trip_id, passengers } = req.body;
    const user_id = req.user.id;

    try {
        const trip = await TripModel.findById(trip_id);
        if (!trip) return res.status(404).json({ message: 'الرحلة غير موجودة.' });

        const totalPassengers = passengers.length + 1;
        if (trip.max_seats < totalPassengers) return res.status(400).json({ message: 'لا توجد مقاعد كافية.' });

        const totalPrice = trip.price * totalPassengers;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalPrice * 100),
            currency: 'usd',
            metadata: { user_id: user_id.toString(), trip_id: trip_id.toString() }
        });

        const bookingId = await BookingModel.createBooking(user_id, trip_id, totalPrice, 'group', paymentIntent.id);

        if (passengers.length > 0) {
            await BookingModel.addPassengers(bookingId, passengers);
        }

        res.status(200).json({ clientSecret: paymentIntent.client_secret, bookingId, totalPrice });
    } catch (error) {
        res.status(500).json({ message: 'فشل بدء الحجز.', error: error.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.user_id;

        await BookingModel.updateStatus(paymentIntent.id, 'confirmed');
        
        // إشعار للمستخدم بنجاح العملية
        await NotificationModel.create(userId, "تم تأكيد الحجز ✅", "شكراً لك! تم دفع ثمن الرحلة بنجاح وتأكيد حجزك.");
    }

    res.json({ received: true });
};