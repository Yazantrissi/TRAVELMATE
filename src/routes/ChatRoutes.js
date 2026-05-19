const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const auth = require('../middleware/auth');
const BotRoutes = require('./BotRoutes');

router.use(auth);

// Chatbot
router.use('/bot', BotRoutes);


// ─── Groups ───────────────────────────────────────────────
router.get('/groups', ChatController.getUserGroups);
router.post('/groups', ChatController.createGroup);
router.get('/groups/:id/messages', ChatController.getGroupMessages);
router.post('/groups/:id/messages', ChatController.sendGroupMessage);

// ─── Rooms ────────────────────────────────────────────────
router.get('/rooms/:tripId', ChatController.getOrCreateRoom);
router.post('/rooms/:roomId/messages', ChatController.sendMessage);
router.get('/rooms/:roomId/messages', ChatController.getMessages);

// ─── Search Users ─────────────────────────────────────────
router.get('/users', ChatController.searchUsers);

module.exports = router;
