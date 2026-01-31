const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');
const { 
    contactValidation, 
    idParamValidation, 
    validate 
} = require('../utils/validators');


// POST /api/contact - Submit contact form (rate limited)
router.post('/', 
    contactLimiter,
    contactValidation, 
    validate, 
    contactController.createContact
);

// Protected Routes (Admin Only)

// GET /api/contact - Get all contacts
router.get('/', 
    authMiddleware, 
    contactController.getAllContacts
);

// GET /api/contact/:id - Get single contact
router.get('/:id', 
    authMiddleware, 
    idParamValidation,
    validate,
    contactController.getContactById
);

// DELETE /api/contact/:id - Delete contact
router.delete('/:id', 
    authMiddleware, 
    idParamValidation,
    validate,
    contactController.deleteContact
);

module.exports = router;