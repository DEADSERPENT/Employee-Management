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
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true, // Ensures valid email format
                },
                set(value) {
                    this.setDataValue('email', value.toLowerCase());
                },
            },
            phonenumber: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                validate: {
                    isNumeric: true, // Ensures only numbers
                    len: [10], // Ensures 10 digits
                },
            },
            designation: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            employeeId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        },
        {
            timestamps: false, // Enables createdAt and updatedAt fields
            tableName: 'users', 
            underscored: false, // Ensures snake_case column names
        }
    );

    return User;
};