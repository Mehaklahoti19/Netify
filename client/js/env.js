/**
 * Environment Configuration
 * 
 * This file handles environment variables for the frontend.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Deploy backend to Render first
 *    - Get your Render backend URL (e.g., https://netflix-api-xxxxx.onrender.com)
 * 
 * 2. Update the BACKEND_URL below with your Render URL BEFORE deploying to Vercel:
 *    const BACKEND_URL = 'https://netflix-api-xxxxx.onrender.com';
 * 
 * 3. Deploy to Vercel
 * 
 * 4. Add your Vercel URL to Render's ALLOWED_ORIGINS environment variable
 */

// ============================================
// UPDATE THIS URL AFTER DEPLOYING BACKEND TO RENDER
// ============================================

// INSTRUCTIONS:
// 1. Deploy your backend to Render (https://render.com)
// 2. Copy your Render backend URL (looks like: https://netflix-api-abc123.onrender.com)
// 3. Replace the URL below with your actual Render URL
// 4. Redeploy to Vercel

const BACKEND_URL = 'https://netify-r5m7.onrender.com'; // Your actual Render URL

// UNCOMMENT AND UPDATE THIS LINE AFTER DEPLOYING BACKEND:
// const BACKEND_URL = 'https://your-actual-render-url.onrender.com';

// ============================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================

// Environment configuration object
window.ENV = {
    VITE_BACKEND_URL: BACKEND_URL,
    APP_VERSION: '1.0.0'
};

console.log('Environment loaded. Backend URL:', window.ENV.VITE_BACKEND_URL);
