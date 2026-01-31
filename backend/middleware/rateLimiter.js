const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    }
});

/**
 * Strict login rate limiter
 * 5 attempts per hour
 */
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Contact form rate limiter
 * 10 submissions per hour
 */
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Too many contact form submissions. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Upload rate limiter
 * 20 uploads per hour
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        message: 'Too many upload requests. Please try again later.'
    }
});

module.exports = { 
    generalLimiter, 
    loginLimiter, 
    contactLimiter,
    uploadLimiter
};
