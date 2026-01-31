const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Delete a file safely (ignores if file doesn't exist)
 * @param {string} filePath - Absolute or relative path to file
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
const deleteFile = async (filePath) => {
    try {
        const absolutePath = path.isAbsolute(filePath) 
            ? filePath 
            : path.join(__dirname, '..', filePath);
        
        await fs.unlink(absolutePath);
        return true;
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Error deleting file:', error.message);
        }
        return false;
    }
};

/**
 * Delete a file synchronously
 * @param {string} filePath - Path to file
 * @returns {boolean} - True if deleted, false otherwise
 */
const deleteFileSync = (filePath) => {
    try {
        const absolutePath = path.isAbsolute(filePath) 
            ? filePath 
            : path.join(__dirname, '..', filePath);
        
        if (fsSync.existsSync(absolutePath)) {
            fsSync.unlinkSync(absolutePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error.message);
        return false;
    }
};

/**
 * Ensure a directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 */
const ensureDir = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
};

/**
 * Get the upload path for projects
 * @returns {string} - Absolute path to uploads directory
 */
const getUploadsPath = () => {
    return path.join(__dirname, '..', 'uploads', 'projects');
};

module.exports = { 
    deleteFile, 
    deleteFileSync, 
    ensureDir,
    getUploadsPath 
};
