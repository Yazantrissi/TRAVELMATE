const DocumentModel = require('../models/DocumentModel');
const cryptoUtil = require('./crypto');
const fs = require('fs');
const path = require('path');

// Generate passenger manifest JSON/PDF data for company
module.exports.generate = async (bookingId) => {
  const manifest = await DocumentModel.generateManifest(bookingId, process.env.ENCRYPTION_KEY);
  const jsonManifest = {
    bookingId,
    passengers: manifest.map(doc => ({
      fullName: doc.data.full_name,
      passport: doc.data.passport_number,
      age: doc.data.age,
      docType: doc.doc_type
    })),
    timestamp: new Date().toISOString()
  };

  // Save JSON
  const filePath = path.join(process.env.MULTER_DEST || './uploads', `manifest_${bookingId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(jsonManifest, null, 2));

  return { json: jsonManifest, filePath };
};

// Get stats for email/print
module.exports.getSummary = (manifest) => ({
  totalPassengers: manifest.length,
  adults: manifest.filter(p => p.age >= 18).length,
  children: manifest.length - adults
});

