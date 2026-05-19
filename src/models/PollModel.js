const db = require('../config/db');

// Create poll for trip/group decision
exports.create = async (tripId, creatorId, question, options) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO polls (trip_id, creator_id, question, options) VALUES (?, ?, ?, ?)',
      [tripId, creatorId, question, JSON.stringify(options)]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Failed to create poll: ' + error.message);
  }
};

// Vote on poll option
exports.vote = async (pollId, userId, optionIndex) => {
  // Prevent duplicate votes
  const existing = await db.execute(
    'SELECT 1 FROM poll_votes WHERE poll_id = ? AND user_id = ?',
    [pollId, userId]
  );
  if (existing[0].length > 0) {
    throw new Error('Already voted');
  }

  const [result] = await db.execute(
    'INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES (?, ?, ?)',
    [pollId, userId, optionIndex]
  );
  return result.insertId;
};

// Get poll with votes tally
exports.getPoll = async (pollId) => {
  const [poll] = await db.execute('SELECT * FROM polls WHERE id = ?', [pollId]);
  if (!poll.length) return null;

  const [votes] = await db.execute(
    'SELECT option_index, COUNT(*) as count FROM poll_votes WHERE poll_id = ? GROUP BY option_index',
    [pollId]
  );

  return {
    ...poll[0],
    options: JSON.parse(poll[0].options),
    votes: votes.reduce((acc, v) => {
      acc[v.option_index] = v.count;
      return acc;
    }, {})
  };
};

// Get user's trip polls
exports.getTripPolls = async (tripId) => {
  const [rows] = await db.execute('SELECT * FROM polls WHERE trip_id = ? ORDER BY created_at DESC', [tripId]);
  return rows;
};

