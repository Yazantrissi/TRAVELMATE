const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const BotController = require('../controllers/BotController');

router.use(auth);

// POST /api/chat/bot/message
router.post('/message', BotController.message);

module.exports = router;

