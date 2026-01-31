module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        titleEn: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'title_en',
            validate: {
                notEmpty: true
            }
        },
        titleAr: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'title_ar'
        },
        descriptionEn: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'description_en',
            validate: {
                notEmpty: true
            }
        },
        descriptionAr: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description_ar'
        },
        image: {
            type: DataTypes.STRING(500),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        tableName: 'projects',
        timestamps: true
    });

    return Project;
};