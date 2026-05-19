const express = require('express');
const router = express.Router();
const PollController = require('../controllers/PollController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/trips/:tripId/polls', PollController.createPoll);
router.post('/polls/:pollId/vote', PollController.vote);
router.get('/polls/:pollId', PollController.getPoll);

module.exports = router;

