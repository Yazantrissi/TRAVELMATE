const NotificationModel = require('../models/NotificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.getByUserId(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'خطأ في جلب الإشعارات' });
    }
};

exports.readNotification = async (req, res) => {
    try {
        await NotificationModel.markAsRead(req.params.id);
        res.status(200).json({ message: 'تم تحديث حالة الإشعار' });
    } catch (error) {
        res.status(500).json({ message: 'فشل تحديث الإشعار' });
    }
};