const express = require('express');
const router = express.Router();
const FriendController = require('../controllers/FriendController');
const auth = require('../middleware/auth');

// جميع الروابط هنا تتطلب تسجيل دخول
router.use(auth);

router.post('/search', FriendController.searchFriend);
router.post('/request', FriendController.addFriend);
router.get('/list', FriendController.listFriends);
router.put('/respond', FriendController.respondToRequest);

module.exports = router;