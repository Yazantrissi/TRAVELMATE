const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth);
router.use(admin); // Admin only

router.get('/dashboard', AdminController.getDashboard);
router.post('/trips', AdminController.createTrip);

module.exports = router;

