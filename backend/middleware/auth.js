const jwt = require('jsonwebtoken');
const db = require('../models');
const { errorResponse } = require('../utils/responseHandler');


const authMiddleware = async (req, res, next) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'No token provided. Authorization denied.', 401);
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(res, 'No token provided. Authorization denied.', 401);
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return errorResponse(res, 'Token has expired. Please login again.', 401);
            }
            return errorResponse(res, 'Invalid token.', 401);
        }

        // Find admin by decoded ID
        const admin = await db.Admin.findByPk(decoded.id, {
            attributes: ['id', 'username']
        });

        if (!admin) {
            return errorResponse(res, 'Admin not found. Token invalid.', 401);
        }

        // Attach admin to request
        req.admin = {
            id: admin.id,
            username: admin.username
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return errorResponse(res, 'Authorization failed.', 500, error);
    }
};

module.exports = authMiddleware;