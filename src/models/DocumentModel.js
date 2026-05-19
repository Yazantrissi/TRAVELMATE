const db = require('../config/db');
const crypto = require('crypto-js/aes');
const CryptoJS = require('crypto-js');

// Encrypt document data (passport etc.) before DB store
exports.encryptData = (data, secretKey) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Decrypt (admin/booking use only)
exports.decryptData = (encryptedData, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Create encrypted doc record for user/booking
exports.create = async (userId, bookingId, docType, rawData, secretKey) => {
  try {
    const encryptedData = exports.encryptData(rawData, secretKey);
    const [result] = await db.execute(
      'INSERT INTO documents (user_id, booking_id, doc_type, encrypted_data) VALUES (?, ?, ?, ?)',
      [userId, bookingId, docType, encryptedData]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Failed to create document: ' + error.message);
  }
};

// Get user's docs for manifest gen (decrypted by caller)
exports.getByBooking = async (bookingId) => {
  const [rows] = await db.execute(
    'SELECT * FROM documents WHERE booking_id = ?',
    [bookingId]
  );
  return rows;
};

// Generate manifest JSON from decrypted docs
exports.generateManifest = async (bookingId, secretKey) => {
  const docs = await exports.getByBooking(bookingId);
  const manifest = docs.map(doc => ({
    ...doc,
    data: exports.decryptData(doc.encrypted_data, secretKey)
  }));
  return manifest;
};

