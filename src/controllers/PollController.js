const PollModel = require('../models/PollModel');

// Create poll
exports.createPoll = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { question, options } = req.body;
    const pollId = await PollModel.create(tripId, req.user.id, question, options);
    res.status(201).json({ pollId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vote
exports.vote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    await PollModel.vote(pollId, req.user.id, parseInt(optionIndex));
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get poll results
exports.getPoll = async (req, res) => {
  const { pollId } = req.params;
  try {
    const poll = await PollModel.getPoll(pollId);
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

