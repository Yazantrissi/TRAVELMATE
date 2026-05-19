const db = require('../config/db');

// Create trip chat room
exports.createRoom = async (tripId, creatorId) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO chat_rooms (trip_id, creator_id) VALUES (?, ?)',
      [tripId, creatorId]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Failed to create chat room: ' + error.message);
  }
};

// Add message to room
exports.addMessage = async (roomId, userId, message, type = 'text') => {
  const [result] = await db.execute(
    'INSERT INTO chat_messages (room_id, user_id, message, type) VALUES (?, ?, ?, ?)',
    [roomId, userId, message, type]
  );
  return result.insertId;
};

// Get room messages (paginated)
exports.getMessages = async (roomId, limit = 50, offset = 0) => {
  const [rows] = await db.execute(
    `SELECT m.*, u.username FROM chat_messages m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.room_id = ? 
     ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
    [roomId, limit, offset]
  );
  return rows.reverse(); // Chronological
};

// Get user's rooms
exports.getUserRooms = async (userId) => {
  const query = `
    SELECT DISTINCT cr.*, t.title FROM chat_rooms cr
    JOIN trips t ON cr.trip_id = t.id
    WHERE cr.creator_id = ? OR EXISTS (
      SELECT 1 FROM bookings b WHERE b.user_id = ? AND b.trip_id = cr.trip_id
    )
  `;
  const [rows] = await db.execute(query, [userId, userId]);
  return rows;
};

