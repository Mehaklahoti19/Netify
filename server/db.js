/**
 * Database Configuration Module
 * 
 * This module establishes a connection pool to the MySQL database
 * using mysql2 package with promise support for async/await operations.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for better performance
// Pool allows multiple concurrent connections to be reused
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    
    // Pool configuration
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // Enable SSL for Aiven MySQL cloud connection
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection on startup
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Initialize database - create users table if not exists
const initDatabase = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.execute(createTableQuery);
        console.log('Users table initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error.message);
    }
};

module.exports = {
    pool,
    testConnection,
    initDatabase
};
