import { Sequelize } from 'sequelize';
import { createUserModel } from '../model/userSchema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration with environment variables
const sequelize = new Sequelize(
    process.env.DB_NAME || 'employee_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            max: 3
        }
    }
);

// Initialize UserModel (will be set after connection)
let UserModel = null;

// Connect to database with retry logic
const connect = async (retries = 3) => {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');

        // Create model after successful connection
        UserModel = createUserModel(sequelize);

        // Sync database
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✓ Database synchronized successfully');

        return true;
    } catch (error) {
        console.error('✗ Unable to connect to the database:', error.message);

        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return connect(retries - 1);
        }

        throw new Error('Failed to connect to database after multiple attempts');
    }
};

// Graceful shutdown
const disconnect = async () => {
    try {
        await sequelize.close();
        console.log('✓ Database connection closed successfully');
    } catch (error) {
        console.error('✗ Error closing database connection:', error.message);
    }
};

// Get UserModel (with validation)
const getUserModel = () => {
    if (!UserModel) {
        throw new Error('UserModel not initialized. Ensure database is connected first.');
    }
    return UserModel;
};

export { sequelize, connect, disconnect, getUserModel };