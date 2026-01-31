const { DataTypes } = require('sequelize');
const { connection } = require('../config/database');

// Import model definitions
const Admin = require('./Admin')(connection, DataTypes);
const Contact = require('./Contact')(connection, DataTypes);
const Project = require('./Project')(connection, DataTypes);

// Define associations if needed in the future
// Example: Admin.hasMany(Project);
// Example: Project.belongsTo(Admin);

// Export models and connection
module.exports = {
    connection,
    Admin,
    Contact,
    Project
};
