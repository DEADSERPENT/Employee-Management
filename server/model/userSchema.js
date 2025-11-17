import { DataTypes } from 'sequelize';

export const createUserModel = (sequelize) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Username cannot be empty'
                    },
                    len: {
                        args: [2, 100],
                        msg: 'Username must be between 2 and 100 characters'
                    }
                }
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    name: 'unique_email',
                    msg: 'Email already exists'
                },
                validate: {
                    isEmail: {
                        msg: 'Must be a valid email address'
                    },
                    notEmpty: {
                        msg: 'Email cannot be empty'
                    }
                },
                set(value) {
                    this.setDataValue('email', value.toLowerCase().trim());
                },
            },
            phonenumber: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    name: 'unique_phone',
                    msg: 'Phone number already exists'
                },
                validate: {
                    isNumeric: {
                        msg: 'Phone number must contain only numbers'
                    },
                    len: {
                        args: [10, 10],
                        msg: 'Phone number must be exactly 10 digits'
                    }
                },
            },
            designation: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Designation cannot be empty'
                    }
                }
            },
            employeeId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    name: 'unique_employee_id',
                    msg: 'Employee ID already exists'
                },
                validate: {
                    notEmpty: {
                        msg: 'Employee ID cannot be empty'
                    }
                }
            },
        },
        {
            timestamps: true, // Enable createdAt and updatedAt fields
            tableName: 'users',
            underscored: false,
            indexes: [
                {
                    unique: true,
                    fields: ['email']
                },
                {
                    unique: true,
                    fields: ['employeeId']
                },
                {
                    unique: true,
                    fields: ['phonenumber']
                }
            ]
        }
    );

    return User;
};