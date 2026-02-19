/**
 * Authentication Module
 * 
 * Handles login and signup form submissions, validation, and user feedback.
 * Provides a smooth user experience with loading states and error handling.
 */

/**
 * Initialize the login form handler
 * Sets up event listeners and form submission logic
 */
const initLoginForm = () => {
    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        hideMessage(errorMessage);
        hideMessage(successMessage);
        
        // Get form data
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Client-side validation
        if (!validateEmail(email)) {
            showMessage(errorMessage, 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showMessage(errorMessage, 'Password must be at least 6 characters');
            return;
        }
        
        // Set loading state
        setLoadingState(submitBtn, true);
        
        try {
            // Make API request
            const response = await window.API.auth.login({ email, password });
            
            if (response.success) {
                // Show success message
                showMessage(successMessage, 'Login successful! Redirecting...');
                
                // Store user data in localStorage (optional)
                localStorage.setItem('netflix_user', JSON.stringify(response.user));
                
                // Redirect to home page after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(errorMessage, response.message || 'Login failed');
            }
            
        } catch (error) {
            showMessage(errorMessage, error.message || 'An error occurred. Please try again.');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });
};

/**
 * Initialize the signup form handler
 * Sets up event listeners and form submission logic
 */
const initSignupForm = () => {
    const form = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        hideMessage(errorMessage);
        hideMessage(successMessage);
        
        // Get form data
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value.trim();
        
        // Client-side validation
        if (username.length < 3) {
            showMessage(errorMessage, 'Username must be at least 3 characters');
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage(errorMessage, 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showMessage(errorMessage, 'Password must be at least 6 characters');
            return;
        }
        
        // Set loading state
        setLoadingState(submitBtn, true);
        
        try {
            // Make API request
            const response = await window.API.auth.register({
                username,
                email,
                password,
                phone
            });
            
            if (response.success) {
                // Show success message
                showMessage(successMessage, 'Account created successfully! Redirecting to login...');
                
                // Clear form
                form.reset();
                
                // Redirect to login page after short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(errorMessage, response.message || 'Registration failed');
            }
            
        } catch (error) {
            showMessage(errorMessage, error.message || 'An error occurred. Please try again.');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Show a message in the specified element
 * @param {HTMLElement} element - Message container element
 * @param {string} message - Message text
 */
const showMessage = (element, message) => {
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
};

/**
 * Hide a message element
 * @param {HTMLElement} element - Message container element
 */
const hideMessage = (element) => {
    if (element) {
        element.textContent = '';
        element.classList.remove('show');
    }
};

/**
 * Set loading state on a button
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Whether to show loading state
 */
const setLoadingState = (button, isLoading) => {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span> Please wait...';
    } else {
        button.disabled = false;
        // Restore original text based on form type
        const isSignup = document.getElementById('signupForm');
        button.textContent = isSignup ? 'Sign Up' : 'Sign In';
    }
};

/**
 * Check if user is logged in
 * @returns {object|null} - User data or null
 */
const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem('netflix_user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error reading user data:', error);
        return null;
    }
};

/**
 * Logout current user
 */
const logout = () => {
    localStorage.removeItem('netflix_user');
    window.location.href = 'login.html';
};

/**
 * Update UI based on authentication state
 * Call this on pages that need auth-aware UI
 */
const updateAuthUI = () => {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('.btn-login');
    
    if (user && loginBtn) {
        // User is logged in - change login button to show username
        loginBtn.textContent = user.username;
        loginBtn.href = '#';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Do you want to logout?')) {
                logout();
            }
        };
    }
};

// Export functions for use in other scripts
window.Auth = {
    initLoginForm,
    initSignupForm,
    getCurrentUser,
    logout,
    updateAuthUI
};
