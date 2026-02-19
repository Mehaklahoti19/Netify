/**
 * Authentication Routes Module
 * 
 * Handles user registration and login functionality.
 * Uses bcrypt for secure password hashing.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();

// Salt rounds for bcrypt hashing
// Higher value = more secure but slower
const SALT_ROUNDS = 10;

/**
 * POST /api/register
 * Register a new user
 * 
 * Request body: { username, email, password, phone }
 * Response: { success: boolean, message: string }
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if email already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user into database
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, phone || null]
        );

        // Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

/**
 * POST /api/login
 * Authenticate existing user
 * 
 * Request body: { email, password }
 * Response: { success: boolean, message: string, user?: object }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const [users] = await pool.execute(
            'SELECT id, username, email, password, phone FROM users WHERE email = ?',
            [email]
        );

        // Check if user exists
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Compare provided password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Remove password from user object before sending response
        const { password: _, ...userWithoutPassword } = user;

        // Return success response with user data
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

module.exports = router;
