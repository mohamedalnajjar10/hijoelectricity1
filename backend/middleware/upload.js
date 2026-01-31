const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload directory configuration
const UPLOAD_DIR = path.join(__dirname, '../uploads/projects');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed file types
const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp/;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5MB default

/**
 * Multer disk storage configuration
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: project-timestamp-random.ext
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `project-${uniqueSuffix}${ext}`);
    }
});

/**
 * File filter - only allow image files
 */
const fileFilter = (req, file, cb) => {
    // Check extension
    const extValid = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
    
    // Check MIME type
    const mimeValid = ALLOWED_TYPES.test(file.mimetype.split('/')[1]);

    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
};

/**
 * Multer upload instance
 */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Only allow single file upload
    }
});

module.exports = upload;