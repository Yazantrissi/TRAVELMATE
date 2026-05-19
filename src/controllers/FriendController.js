const FriendModel = require('../models/FriendModel');
const NotificationModel = require('../models/NotificationModel');

// البحث عن صديق برقم الهاتف
exports.searchFriend = async (req, res) => {
    const { phone_number } = req.body;
    try {
        const friend = await FriendModel.searchByPhone(phone_number);
        if (!friend) return res.status(404).json({ message: 'المستخدم غير موجود.' });
        if (friend.id === req.user.id) return res.status(400).json({ message: 'لا يمكنك إضافة نفسك.' });
        
        res.status(200).json(friend);
    } catch (error) {
        res.status(500).json({ message: 'خطأ في البحث.', error: error.message });
    }
};

// إرسال طلب صداقة + إشعار للطرف الآخر
exports.addFriend = async (req, res) => {
    const { friend_id, category } = req.body;
    const user_id = req.user.id;

    try {
        const exists = await FriendModel.checkExistingFriendship(user_id, friend_id);
        if (exists) return res.status(400).json({ message: 'الطلب موجود مسبقاً.' });

        await FriendModel.sendRequest(user_id, friend_id, category || 'Friends');
        
        // إرسال إشعار للمستلم
        await NotificationModel.create(friend_id, "طلب صداقة جديد", `لديك طلب صداقة جديد من ${req.user.username}`);
        
        res.status(201).json({ message: 'تم إرسال الطلب بنجاح.' });
    } catch (error) {
        res.status(500).json({ message: 'فشل إرسال الطلب.', error: error.message });
    }
};

// قبول أو رفض الطلب + إشعار بالنتيجة
exports.respondToRequest = async (req, res) => {
    const { request_id, status, sender_id } = req.body; 
    try {
        const updated = await FriendModel.updateStatus(request_id, status);
        if (updated === 0) return res.status(404).json({ message: 'الطلب غير موجود.' });
        
        if (status === 'accepted') {
            await NotificationModel.create(sender_id, "تم قبول طلبك", `${req.user.username} قبل طلب صداقتك الآن.`);
        }
        
        res.status(200).json({ message: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} الطلب.` });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في معالجة الطلب.' });
    }
};

exports.listFriends = async (req, res) => {
    try {
        const friends = await FriendModel.getFriendsList(req.user.id);
        res.status(200).json({ friends });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في جلب الأصدقاء.' });
    }
};