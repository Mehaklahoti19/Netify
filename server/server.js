/**
 * Netflix Movie Web Application - Server Entry Point
 * 
 * PRODUCTION-READY SERVER CONFIGURATION
 * 
 * Deployment Instructions:
 * 1. Deploy backend to Render:
 *    - Create new Web Service on render.com
 *    - Connect your GitHub repo
 *    - Set environment variables in Render dashboard
 *    - Build Command: npm install
 *    - Start Command: npm start
 * 
 * 2. Environment Variables Required:
 *    - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT (Aiven MySQL)
 *    - OMDB_API_KEY (from omdbapi.com)
 *    - PORT (Render sets this automatically)
 *    - NODE_ENV=production
 * 
 * 3. After deployment, update FRONTEND_URL in api.js with your Netlify URL
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database configuration
const { testConnection, initDatabase } = require('./db');

// Import route modules
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');

// Initialize Express application
const app = express();

// ============================================
// SERVER CONFIGURATION
// ============================================

// Use Render's PORT or fallback to 5000 for local development
const PORT = process.env.PORT || 5000;

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

// ============================================
// CORS CONFIGURATION - Production Ready
// ============================================

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all origins in production (for Vercel deployment)
        // TODO: For better security, restrict to specific origins in production
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const origin = req.headers.origin || 'no-origin';
    console.log(`[${timestamp}] ${method} ${path} - Origin: ${origin}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Root health check - for Render deployment verification
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Netflix Movie API Server is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            movies: '/api/movies',
            auth: '/api/register, /api/login'
        }
    });
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        success: true,
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.use('/api', authRoutes);

// Movies routes
app.use('/api/movies', movieRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 - Route not found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS error: Origin not allowed'
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// SERVER INITIALIZATION
// ============================================

const startServer = async () => {
    try {
        // Test database connection
        console.log('Connecting to database...');
        await testConnection();
        
        // Initialize database tables
        console.log('Initializing database tables...');
        await initDatabase();
        
        // Start the server
        app.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log('  Netflix Movie App Server - PRODUCTION READY');
            console.log('='.repeat(60));
            console.log(`  Server running on port: ${PORT}`);
            console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  Allowed Origins: ${allowedOrigins.join(', ')}`);
            console.log(`  Health Check: http://localhost:${PORT}/`);
            console.log(`  API Base: http://localhost:${PORT}/api`);
            console.log('='.repeat(60));
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
