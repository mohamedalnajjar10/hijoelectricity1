const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { loginValidation, validate } = require('../utils/validators');

// POST /api/auth/login - Admin login (rate limited)
router.post('/login', 
    loginLimiter, 
    loginValidation, 
    validate, 
    authController.login
);

// GET /api/auth/verify - Verify token
router.get('/verify', 
    authMiddleware, 
    authController.verify
);

module.exports = router;