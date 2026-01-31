module.exports = (sequelize, DataTypes) => {
    const Contact = sequelize.define('Contact', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Name is required' },
                len: {
                    args: [2, 100],
                    msg: 'Name must be between 2 and 100 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Email is required' },
                isEmail: { msg: 'Please provide a valid email address' }
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Message is required' }
            }
        }
    }, {
        tableName: 'contacts',
        timestamps: true,
        updatedAt: false 
    });

    return Contact;
};