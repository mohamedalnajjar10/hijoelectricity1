/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Error} error - Error object (only shown in development)
 */
const errorResponse = (res, message, statusCode = 500, error = null) => {
    const response = {
        success: false,
        message
    };
    
    if (process.env.NODE_ENV === 'development' && error) {
        response.error = error.message || error;
    }
    
    return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
const paginatedResponse = (res, data, total, page = 1, limit = 10) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    });
};

module.exports = { 
    successResponse, 
    errorResponse, 
    paginatedResponse 
};
