const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/DocumentController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/upload/:bookingId', DocumentController.uploadDoc);
router.get('/manifest/:bookingId', DocumentController.generateManifest);

module.exports = router;

