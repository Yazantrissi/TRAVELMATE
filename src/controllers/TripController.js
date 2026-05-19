const TripModel = require('../models/TripModel');

// ===================================
// 1. إضافة رحلة جديدة (Admin Only)
// ===================================
exports.addTrip = async (req, res) => {
    // يجب أن تكون بيانات الإدخال كاملة لضمان جودة الرحلة
    const { title, description, price, start_date, end_date, location, transport_type, image_url, max_seats } = req.body;

    if (!title || !price || !start_date || !end_date) {
        return res.status(400).json({ message: 'الرجاء إدخال الحقول الإلزامية (العنوان، السعر، تاريخي البدء والانتهاء).' });
    }
    
    // التحقق من أن السعر وعدد المقاعد أرقام موجبة
    if (price <= 0 || max_seats <= 0) {
        return res.status(400).json({ message: 'السعر وعدد المقاعد يجب أن يكونا أرقاماً موجبة.' });
    }

    try {
        const tripId = await TripModel.create(title, description, price, start_date, end_date, location, transport_type, image_url, max_seats);
        res.status(201).json({ message: 'تمت إضافة الرحلة بنجاح.', tripId });
    } catch (error) {
        console.error('Error adding trip:', error);
        res.status(500).json({ message: 'فشل في إضافة الرحلة.', error: error.message });
    }
};

// ===================================
// 2. عرض جميع الرحلات (Public)
// ===================================
exports.getAllTrips = async (req, res) => {
    try {
        const trips = await TripModel.findAll();
        res.status(200).json({ trips });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ message: 'فشل في جلب قائمة الرحلات.', error: error.message });
    }
};

// ===================================
// 3. عرض تفاصيل رحلة واحدة (Public)
// ===================================
exports.getTripDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const trip = await TripModel.findById(id);
        
        if (!trip) {
            return res.status(404).json({ message: 'الرحلة المطلوبة غير موجودة.' });
        }
        
        res.status(200).json({ trip });
    } catch (error) {
        console.error('Error fetching trip details:', error);
        res.status(500).json({ message: 'فشل في جلب تفاصيل الرحلة.', error: error.message });
    }
};


// ===================================
// 4. تعديل رحلة (Admin Only)
// ===================================
exports.updateTrip = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, start_date, end_date, location, transport_type, image_url, max_seats } = req.body;

    try {
        const updatedRows = await TripModel.update(id, title, description, price, start_date, end_date, location, transport_type, image_url, max_seats);
        
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'الرحلة غير موجودة أو لم يتم إدخال أي تغييرات.' });
        }
        
        res.status(200).json({ message: 'تم تحديث بيانات الرحلة بنجاح.' });
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ message: 'فشل في تحديث الرحلة.', error: error.message });
    }
};