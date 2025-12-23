const FriendModel = require('../models/FriendModel');

// البحث عن صديق برقم الهاتف
exports.searchFriend = async (req, res) => {
    const { phone_number } = req.body;
    try {
        const friend = await FriendModel.searchByPhone(phone_number);
        if (!friend) return res.status(404).json({ message: 'المستخدم غير موجود.' });
        
        // منع المستخدم من البحث عن نفسه
        if (friend.id === req.user.id) {
            return res.status(400).json({ message: 'لا يمكنك إضافة نفسك كصديق.' });
        }
        
        res.status(200).json(friend);
    } catch (error) {
        res.status(500).json({ message: 'خطأ في البحث.', error: error.message });
    }
};

// إرسال طلب صداقة
exports.addFriend = async (req, res) => {
    const { friend_id, category } = req.body; // category: 'Family' or 'Friends'
    const user_id = req.user.id;

    try {
        const exists = await FriendModel.checkExistingFriendship(user_id, friend_id);
        if (exists) return res.status(400).json({ message: 'الطلب موجود مسبقاً أو أنتما أصدقاء بالفعل.' });

        await FriendModel.sendRequest(user_id, friend_id, category || 'Friends');
        res.status(201).json({ message: 'تم إرسال طلب الصداقة بنجاح.' });
    } catch (error) {
        res.status(500).json({ message: 'فشل إرسال الطلب.', error: error.message });
    }
};

// عرض قائمة الأصدقاء
exports.listFriends = async (req, res) => {
    try {
        const friends = await FriendModel.getFriendsList(req.user.id);
        res.status(200).json({ friends });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في جلب الأصدقاء.' });
    }
};

// قبول أو رفض الطلب
exports.respondToRequest = async (req, res) => {
    const { request_id, status } = req.body; // status: 'accepted' or 'rejected'
    try {
        const updated = await FriendModel.updateStatus(request_id, status);
        if (updated === 0) return res.status(404).json({ message: 'الطلب غير موجود.' });
        
        res.status(200).json({ message: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} الطلب بنجاح.` });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في معالجة الطلب.' });
    }
};