const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        // Remove potentially dangerous HTML and script tags
        return value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    
    if (value && typeof value === 'object') {
        const sanitized = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                sanitized[key] = sanitizeValue(value[key]);
            }
        }
        return sanitized;
    }
    
    return value;
};

/**
 * Sanitization middleware
 * Cleans request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    
    if (req.query) {
        req.query = sanitizeValue(req.query);
    }
    
    if (req.params) {
        req.params = sanitizeValue(req.params);
    }
    
    next();
};

module.exports = sanitizeInput;
