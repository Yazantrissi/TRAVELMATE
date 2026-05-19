const DocumentModel = require('../models/DocumentModel');
const cryptoUtil = require('../utils/crypto');
const manifestUtil = require('../utils/manifest');
const multer = require('multer');
const upload = multer({ dest: process.env.MULTER_DEST || 'uploads/' });

// Upload & encrypt doc
exports.uploadDoc = async (req, res) => {
  try {
    const { bookingId, docType } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file' });

    // Extract text/ data from file (simple for PDF/img OCR later)
    const rawData = { filename: file.filename, type: docType /* OCR data */ };
    const docId = await DocumentModel.create(req.user.id, bookingId, docType, rawData, process.env.ENCRYPTION_KEY);
    
    res.json({ docId, filename: file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gen manifest
exports.generateManifest = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const manifest = await manifestUtil.generate(bookingId);
    res.json(manifest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

