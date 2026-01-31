const { body, param, validationResult } = require('express-validator');

/**
 * Contact form validation rules
 */
const contactValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone('any').withMessage('Please provide a valid phone number'),
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
];

/**
 * Project validation rules
 */
const projectValidation = [
    body('titleEn')
        .trim()
        .notEmpty().withMessage('English title is required')
        .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),
    body('titleAr')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('Arabic title cannot exceed 255 characters'),
    body('descriptionEn')
        .trim()
        .notEmpty().withMessage('English description is required'),
    body('descriptionAr')
        .optional({ checkFalsy: true })
        .trim()
];

/**
 * Login validation rules
 */
const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

/**
 * ID parameter validation
 */
const idParamValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID format')
];

/**
 * Status update validation
 */
const statusValidation = [
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isIn(['read', 'unread', 'replied']).withMessage('Invalid status value')
];

/**
 * Validation middleware - checks for validation errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

module.exports = { 
    contactValidation, 
    projectValidation, 
    loginValidation,
    idParamValidation,
    statusValidation,
    validate
};
