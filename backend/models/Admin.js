const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 50]
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        tableName: 'admins',
        timestamps: true,
        hooks: {
            beforeCreate: async (admin) => {
                if (admin.password) {
                    const salt = await bcrypt.genSalt(10);
                    admin.password = await bcrypt.hash(admin.password, salt);
                }
            },
            beforeUpdate: async (admin) => {
                if (admin.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    admin.password = await bcrypt.hash(admin.password, salt);
                }
            }
        }
    });

    Admin.prototype.comparePassword = async function (candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    };

    Admin.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        delete values.password;
        return values;
    };

    return Admin;
};