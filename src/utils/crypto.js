const CryptoJS = require('crypto-js');

const secretKey = process.env.ENCRYPTION_KEY; // 32+ chars from .env

if (!secretKey) {
  throw new Error('ENCRYPTION_KEY not set in .env');
}

module.exports = {
  encrypt: (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  },

  decrypt: (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  },

  // For docs/manifest
  encryptDoc: (docData) => module.exports.encrypt(docData),
  decryptDoc: (encDoc) => module.exports.decrypt(encDoc)
};

