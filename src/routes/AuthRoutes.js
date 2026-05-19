const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ─── Public ───────────────────────────────────────────────
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// ─── Admin Dashboard ──────────────────────────────────────
router.get('/stats',        auth, admin, AuthController.getStats);
router.get('/bookings-all', auth, admin, AuthController.getAllBookings);
router.get('/users',        auth, admin, AuthController.getAllUsers);
router.post('/users',       auth, admin, AuthController.addUser);
router.put('/users/:id',    auth, admin, AuthController.updateUser);
router.delete('/users/:id', auth, admin, AuthController.deleteUser);

module.exports = router;
