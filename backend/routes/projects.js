const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { 
    projectValidation, 
    idParamValidation, 
    validate 
} = require('../utils/validators');


// GET /api/projects - Get all projects
router.get('/', 
    projectController.getAllProjects
);

// GET /api/projects/:id - Get single project
router.get('/:id', 
    idParamValidation,
    validate,
    projectController.getProjectById
);

// Protected Routes (Admin Only)

// POST /api/projects - Create new project
router.post('/', 
    authMiddleware, 
    uploadLimiter,
    upload.single('image'), 
    projectController.createProject
);

// PUT /api/projects/:id - Update project
router.put('/:id', 
    authMiddleware, 
    uploadLimiter,
    idParamValidation,
    validate,
    upload.single('image'), 
    projectController.updateProject
);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', 
    authMiddleware, 
    idParamValidation,
    validate,
    projectController.deleteProject
);

module.exports = router;