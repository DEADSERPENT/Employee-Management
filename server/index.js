import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connect, disconnect } from './postgres/postgres.js';
import router from './view/routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use(router);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 3000;
let server;

// Graceful startup
const startServer = async () => {
    try {
        // Connect to database first
        await connect();

        // Start server after successful database connection
        server = app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('✓ HTTP server closed');
            await disconnect();
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('✗ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        await disconnect();
        process.exit(0);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('✗ Uncaught Exception:', error);
    shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
});

// Start the server
startServer();