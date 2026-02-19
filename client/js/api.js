/**
 * API Module
 * 
 * Centralized API configuration and helper functions for making HTTP requests.
 * Provides a clean interface for communicating with the backend server.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. LOCAL DEVELOPMENT:
 *    - Backend runs on: http://localhost:5000
 *    - Frontend runs on: http://localhost:3000 (or any static server)
 *    - No changes needed - uses localhost by default
 * 
 * 2. PRODUCTION DEPLOYMENT:
 *    Step 1: Deploy backend to Render
 *    - After deployment, Render will give you a URL like:
 *      https://netflix-api-xxxxx.onrender.com
 * 
 *    Step 2: Update BACKEND_URL below with your Render URL:
 *    const BACKEND_URL = 'https://netflix-api-xxxxx.onrender.com';
 * 
 *    Step 3: Deploy frontend to Netlify
 *    - Upload client/ folder to Netlify
 *    - Your frontend will be at: https://your-app-name.netlify.app
 * 
 *    Step 4: Add your Netlify URL to Render's ALLOWED_ORIGINS environment variable
 *    - Go to Render Dashboard > Your Service > Environment
 *    - Add: ALLOWED_ORIGINS=https://your-app-name.netlify.app
 */

// ============================================
// BACKEND URL CONFIGURATION
// ============================================
// Change this to your Render backend URL after deployment
const BACKEND_URL = 'http://localhost:5000'; // Local development
// const BACKEND_URL = 'https://your-render-backend-url.onrender.com'; // Production - uncomment and update

// ============================================
// API CONFIGURATION
// ============================================
const API_CONFIG = {
    BASE_URL: `${BACKEND_URL}/api`,
    TIMEOUT: 20000, // 20 seconds (increased for production)
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// ============================================
// API REQUEST HELPER
// ============================================

/**
 * Make an HTTP request to the API
 * @param {string} endpoint - API endpoint (e.g., '/movies/popular')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Response data
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Merge default headers with provided headers
    const headers = {
        ...API_CONFIG.HEADERS,
        ...options.headers
    };
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
            mode: 'cors', // Explicitly set CORS mode
            credentials: 'omit' // Don't send cookies for cross-origin
        });
        
        clearTimeout(timeoutId);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response. Is the backend running?');
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Check if response was successful
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log(`API Response: ${url}`, data);
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. The server may be starting up (Render free tier takes 30-60s to wake up). Please try again.');
        }
        
        if (error.message === 'Failed to fetch') {
            throw new Error(`Cannot connect to server at ${BACKEND_URL}. Please check:\n1. Backend is running\n2. BACKEND_URL is correct in api.js\n3. CORS is configured properly`);
        }
        
        throw error;
    }
};

// ============================================
// AUTHENTICATION API
// ============================================

const authAPI = {
    /**
     * Register a new user
     * @param {object} userData - { username, email, password, phone }
     * @returns {Promise<object>} - Registration response
     */
    register: async (userData) => {
        return apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    /**
     * Login existing user
     * @param {object} credentials - { email, password }
     * @returns {Promise<object>} - Login response with user data
     */
    login: async (credentials) => {
        return apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
};

// ============================================
// MOVIES API
// ============================================

const moviesAPI = {
    /**
     * Get popular movies
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<object>} - Movies data
     */
    getPopular: async (page = 1) => {
        return apiRequest(`/movies/popular?page=${page}`);
    },
    
    /**
     * Get top rated movies
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<object>} - Movies data
     */
    getTopRated: async (page = 1) => {
        return apiRequest(`/movies/top_rated?page=${page}`);
    },
    
    /**
     * Get upcoming movies
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<object>} - Movies data
     */
    getUpcoming: async (page = 1) => {
        return apiRequest(`/movies/upcoming?page=${page}`);
    },
    
    /**
     * Get now playing movies
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<object>} - Movies data
     */
    getNowPlaying: async (page = 1) => {
        return apiRequest(`/movies/now_playing?page=${page}`);
    },
    
    /**
     * Search movies by query
     * @param {string} query - Search query
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<object>} - Search results
     */
    search: async (query, page = 1) => {
        const encodedQuery = encodeURIComponent(query);
        return apiRequest(`/movies/search?query=${encodedQuery}&page=${page}`);
    },
    
    /**
     * Get movie details by ID
     * @param {number} id - Movie ID
     * @returns {Promise<object>} - Movie details
     */
    getDetails: async (id) => {
        return apiRequest(`/movies/${id}`);
    }
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Utility function to check API health
 * @returns {Promise<boolean>} - True if API is healthy
 */
const checkAPIHealth = async () => {
    try {
        console.log(`Checking health at: ${BACKEND_URL}/api/health`);
        const response = await apiRequest('/health');
        console.log('Health check response:', response);
        return response.status === 'ok' || response.success === true;
    } catch (error) {
        console.error('API health check failed:', error.message);
        return false;
    }
};

// ============================================
// EXPORTS
// ============================================

// Export API modules for use in other scripts
window.API = {
    config: API_CONFIG,
    BACKEND_URL,
    request: apiRequest,
    auth: authAPI,
    movies: moviesAPI,
    checkHealth: checkAPIHealth
};

// Log configuration on load
console.log('API Module loaded. Backend URL:', BACKEND_URL);
