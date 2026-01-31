const jwt = require('jsonwebtoken');
const db = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// JWT configuration from environment
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';


// Generate JWT token for admin user

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Admin login
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await db.Admin.findOne({
        where: { username }
    });

    // Check if admin exists and password is valid
    if (!admin || !(await admin.comparePassword(password))) {
        return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(admin.id);

    // Send success response
    return successResponse(res, {
        token,
        admin: {
            id: admin.id,
            username: admin.username
        }
    }, 'Login successful');
});

/**
 * Verify token and return admin info
 * GET /api/auth/verify
 */
exports.verify = asyncHandler(async (req, res) => {
    return successResponse(res, {
        admin: req.admin
    }, 'Token is valid');
});