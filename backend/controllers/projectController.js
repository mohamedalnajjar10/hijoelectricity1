const db = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { deleteFile, deleteFileSync } = require('../utils/fileUtils');
const path = require('path');

/**
 * Get all projects (Public)
 * GET /api/projects
 */
exports.getAllProjects = asyncHandler(async (req, res) => {
    const projects = await db.Project.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'titleEn', 'titleAr', 'descriptionEn', 'descriptionAr', 'image', 'createdAt']
    });

    return successResponse(res, projects, 'Projects fetched successfully');
});

/**
 * Get single project by ID (Public)
 * GET /api/projects/:id
 */
exports.getProjectById = asyncHandler(async (req, res) => {
    const project = await db.Project.findByPk(req.params.id);

    if (!project) {
        return errorResponse(res, 'Project not found', 404);
    }

    return successResponse(res, project, 'Project fetched successfully');
});

/**
 * Create new project (Admin)
 * POST /api/projects
 */
exports.createProject = asyncHandler(async (req, res) => {
    const { titleEn, titleAr, descriptionEn, descriptionAr } = req.body;

    // Validate required fields
    if (!titleEn || !descriptionEn) {
        // Clean up uploaded file if validation fails
        if (req.file) {
            deleteFileSync(path.join(__dirname, '../uploads/projects', req.file.filename));
        }
        return errorResponse(res, 'Title (English) and Description (English) are required', 400);
    }

    // Validate image upload
    if (!req.file) {
        return errorResponse(res, 'Project image is required', 400);
    }

    const imagePath = `/uploads/projects/${req.file.filename}`;

    const project = await db.Project.create({
        titleEn,
        titleAr: titleAr || null,
        descriptionEn,
        descriptionAr: descriptionAr || null,
        image: imagePath
    });

    return successResponse(res, project, 'Project created successfully', 201);
});

/**
 * Update project (Admin)
 * PUT /api/projects/:id
 */
exports.updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { titleEn, titleAr, descriptionEn, descriptionAr } = req.body;

    const project = await db.Project.findByPk(id);

    if (!project) {
        // Clean up uploaded file if project not found
        if (req.file) {
            deleteFileSync(path.join(__dirname, '../uploads/projects', req.file.filename));
        }
        return errorResponse(res, 'Project not found', 404);
    }

    // Build update data
    const updateData = {
        titleEn: titleEn || project.titleEn,
        titleAr: titleAr !== undefined ? titleAr : project.titleAr,
        descriptionEn: descriptionEn || project.descriptionEn,
        descriptionAr: descriptionAr !== undefined ? descriptionAr : project.descriptionAr
    };

    // Handle image update
    if (req.file) {
        // Delete old image
        if (project.image) {
            await deleteFile(path.join(__dirname, '..', project.image));
        }
        updateData.image = `/uploads/projects/${req.file.filename}`;
    }

    await project.update(updateData);

    return successResponse(res, project, 'Project updated successfully');
});

/**
 * Delete project (Admin)
 * DELETE /api/projects/:id
 */
exports.deleteProject = asyncHandler(async (req, res) => {
    const project = await db.Project.findByPk(req.params.id);

    if (!project) {
        return errorResponse(res, 'Project not found', 404);
    }

    // Delete project image
    if (project.image) {
        await deleteFile(path.join(__dirname, '..', project.image));
    }

    await project.destroy();

    return successResponse(res, null, 'Project deleted successfully');
});