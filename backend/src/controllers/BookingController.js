const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BookingModel = require('../models/BookingModel');
const TripModel = require('../models/TripModel');

exports.initiateGroupBooking = async (req, res) => {
    const { trip_id, passengers } = req.body; // passengers هو مصفوفة كائنات
    const user_id = req.user.id;

    try {
        // 1. جلب بيانات الرحلة للتحقق من السعر والمقاعد
        const trip = await TripModel.findById(trip_id);
        if (!trip) return res.status(404).json({ message: 'الرحلة غير موجودة.' });

        const totalPassengers = passengers.length + 1; // المسافرين + المنظم
        if (trip.max_seats < totalPassengers) {
            return res.status(400).json({ message: 'عذراً، لا يوجد مقاعد كافية لهذه الرحلة.' });
        }

        // 2. حساب السعر الإجمالي
        const totalPrice = trip.price * totalPassengers;

        // 3. إنشاء Payment Intent في Stripe (بالسنت)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100, // Stripe يتعامل بالأصغر (مثلاً قرش أو سنت)
            currency: 'usd',
            metadata: { user_id, trip_id }
        });

        // 4. تسجيل الحجز في قاعدة البيانات بحالة "Pending"
        const bookingId = await BookingModel.createBooking(
            user_id, 
            trip_id, 
            totalPrice, 
            'group', 
            paymentIntent.id
        );

        // 5. إضافة المرافقين
        if (passengers && passengers.length > 0) {
            await BookingModel.addPassengers(bookingId, passengers);
        }

        // 6. إرسال client_secret لتطبيق Flutter لإكمال الدفع
        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            bookingId: bookingId,
            totalPrice: totalPrice
        });

    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({ message: 'فشل في بدء عملية الحجز.', error: error.message });
    }
};
// دالة معالجة التنبيهات القادمة من Stripe
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // التحقق من أن الطلب قادم فعلاً من Stripe وليس شخصاً آخر
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // التعامل مع نوع الحدث
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // تحديث حالة الحجز في قاعدة البيانات باستخدام الـ id الخاص بـ Stripe
        await BookingModel.updateStatus(paymentIntent.id, 'confirmed');
        
        console.log(`💰 Payment Succeeded for ID: ${paymentIntent.id}`);
    }

    res.json({ received: true });
};