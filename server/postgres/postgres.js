import { Sequelize } from 'sequelize';
import { createUserModel } from '../model/userSchema.js';

const sequelize = new Sequelize('postgres', 'postgres', 'root', {
    host: 'localhost',
    dialect: 'postgres' 
});

// Create UserModel at the module level
const UserModel = await createUserModel(sequelize);

const connect = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync();
        console.log("Database was synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export { sequelize, connect, UserModel };