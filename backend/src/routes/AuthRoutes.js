const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// مسار: /api/auth/register
router.post('/register', AuthController.register);

// مسار: /api/auth/login
router.post('/login', AuthController.login);

module.exports = router;