/**
 * Main Application Module
 * 
 * Handles the landing page functionality including:
 * - Fetching and displaying movies from TMDB API
 * - Hero section with featured movie
 * - Horizontal scrolling movie rows
 * - Navbar scroll effects
 * - Movie card interactions
 */

// Global state
let featuredMovie = null;

/**
 * Initialize the application
 * Called when DOM is fully loaded
 */
const initApp = async () => {
    console.log('Initializing app...');
    
    // Setup navbar scroll effect
    setupNavbarScroll();
    
    // Check API health with retry
    let isHealthy = false;
    let retries = 3;
    
    while (retries > 0 && !isHealthy) {
        console.log(`Checking API health... (${retries} retries left)`);
        isHealthy = await window.API.checkHealth();
        if (!isHealthy && retries > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
        retries--;
    }
    
    if (!isHealthy) {
        console.error('API health check failed after retries');
        showError('Unable to connect to the server. Please make sure the backend is running on port 5000.');
        return;
    }
    
    console.log('API is healthy, loading movies...');
    
    // Load all movie data
    try {
        await Promise.all([
            loadPopularMovies(),
            loadTopRatedMovies(),
            loadUpcomingMovies()
        ]);
        console.log('All movies loaded successfully');
    } catch (error) {
        console.error('Error loading movies:', error);
        showError('Failed to load movies. Please try again later.');
    }
    
    // Update auth UI if user is logged in
    if (window.Auth) {
        window.Auth.updateAuthUI();
    }
};

/**
 * Setup navbar background change on scroll
 */
const setupNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
};

/**
 * Load popular movies
 */
const loadPopularMovies = async () => {
    const slider = document.getElementById('popularSlider');
    
    try {
        console.log('Fetching popular movies...');
        const data = await window.API.movies.getPopular();
        console.log('Popular movies response:', data);
        
        if (data.success && data.movies && data.movies.length > 0) {
            // Use first movie as featured movie if not set
            if (!featuredMovie) {
                featuredMovie = data.movies[0];
                updateHeroSection(featuredMovie);
            }
            
            renderMovies(slider, data.movies);
        } else {
            console.warn('No popular movies found in response');
            showSliderError(slider, 'No popular movies found');
        }
    } catch (error) {
        console.error('Error loading popular movies:', error);
        showSliderError(slider, 'Failed to load movies: ' + error.message);
    }
};

/**
 * Load top rated movies
 */
const loadTopRatedMovies = async () => {
    const slider = document.getElementById('topRatedSlider');
    
    try {
        const data = await window.API.movies.getTopRated();
        
        if (data.success && data.movies.length > 0) {
            renderMovies(slider, data.movies);
        } else {
            showSliderError(slider, 'No top rated movies found');
        }
    } catch (error) {
        console.error('Error loading top rated movies:', error);
        showSliderError(slider, 'Failed to load movies');
    }
};

/**
 * Load upcoming movies
 */
const loadUpcomingMovies = async () => {
    const slider = document.getElementById('upcomingSlider');
    
    try {
        const data = await window.API.movies.getUpcoming();
        
        if (data.success && data.movies.length > 0) {
            renderMovies(slider, data.movies);
        } else {
            showSliderError(slider, 'No upcoming movies found');
        }
    } catch (error) {
        console.error('Error loading upcoming movies:', error);
        showSliderError(slider, 'Failed to load movies');
    }
};

/**
 * Update hero section with featured movie
 * @param {object} movie - Movie data object
 */
const updateHeroSection = (movie) => {
    const hero = document.getElementById('hero');
    const title = document.getElementById('heroTitle');
    const rating = document.getElementById('heroRating');
    const year = document.getElementById('heroYear');
    const overview = document.getElementById('heroOverview');
    
    if (!movie) return;
    
    // Update background image
    if (movie.backdropPath) {
        hero.style.backgroundImage = `url(${movie.backdropPath})`;
    }
    
    // Update text content
    title.textContent = movie.title;
    rating.textContent = `★ ${movie.rating ? movie.rating.toFixed(1) : 'N/A'}`;
    // OMDb returns releaseDate as just the Year (4 digits)
    year.textContent = movie.releaseDate || 'N/A';
    overview.textContent = movie.overview || 'No description available.';
};

/**
 * Render movies to a slider container
 * @param {HTMLElement} container - Slider container element
 * @param {array} movies - Array of movie objects
 */
const renderMovies = (container, movies) => {
    if (!container || !movies || movies.length === 0) return;
    
    // Clear loading skeletons
    container.innerHTML = '';
    
    // Create movie cards
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
};

/**
 * Create a movie card element
 * @param {object} movie - Movie data object
 * @returns {HTMLElement} - Movie card element
 */
const createMovieCard = (movie) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => onMovieClick(movie);
    
    // Poster image
    const posterUrl = movie.posterPath || 'https://via.placeholder.com/200x300?text=No+Image';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
        <div class="movie-card-info">
            <h3>${movie.title}</h3>
            <div class="card-meta">
                <span class="card-rating">★ ${movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                <span>${movie.releaseDate || 'N/A'}</span>
            </div>
        </div>
    `;
    
    return card;
};

/**
 * Handle movie card click
 * @param {object} movie - Movie data object
 */
const onMovieClick = (movie) => {
    // Update hero section with clicked movie
    updateHeroSection(movie);
    featuredMovie = movie;
    
    // Scroll to hero section
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
};

/**
 * Scroll a movie row horizontally
 * @param {string} sliderId - ID of the slider element
 * @param {number} direction - 1 for right, -1 for left
 */
const scrollRow = (sliderId, direction) => {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const scrollAmount = 800; // Scroll by 4 cards (200px each + gap)
    const currentScroll = slider.scrollLeft;
    const targetScroll = currentScroll + (direction * scrollAmount);
    
    slider.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
};

/**
 * Handle play button click on hero section
 */
const playHeroMovie = () => {
    if (featuredMovie) {
        // In a real app, this would navigate to a video player
        // For now, show an alert with movie info
        alert(`Playing: ${featuredMovie.title}\n\nIn a production app, this would start playing the movie trailer or content.`);
    } else {
        alert('Please select a movie first');
    }
};

/**
 * Handle more info button click on hero section
 */
const showMoreInfo = () => {
    if (featuredMovie) {
        // In a real app, this would show a modal with detailed info
        const info = `
Title: ${featuredMovie.title}
Rating: ${featuredMovie.rating ? featuredMovie.rating.toFixed(1) : 'N/A'}/10
Release Date: ${featuredMovie.releaseDate || 'N/A'}

${featuredMovie.overview || 'No description available.'}
        `.trim();
        
        alert(info);
    } else {
        alert('Please select a movie first');
    }
};

/**
 * Show error message in a slider container
 * @param {HTMLElement} container - Slider container
 * @param {string} message - Error message
 */
const showSliderError = (container, message) => {
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-container" style="padding: 40px; text-align: center;">
            <p style="color: #808080;">${message}</p>
            <button onclick="window.location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #e50914; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
};

/**
 * Show global error message
 * @param {string} message - Error message
 */
const showError = (message) => {
    const heroTitle = document.getElementById('heroTitle');
    const heroRating = document.getElementById('heroRating');
    const heroYear = document.getElementById('heroYear');
    const heroOverview = document.getElementById('heroOverview');
    const heroButtons = document.querySelector('.hero-buttons');
    
    if (heroTitle) heroTitle.textContent = 'Oops! Something went wrong';
    if (heroRating) heroRating.textContent = '';
    if (heroYear) heroYear.textContent = '';
    if (heroOverview) {
        heroOverview.innerHTML = `
            <p style="color: #b3b3b3; margin-bottom: 20px;">${message}</p>
            <button onclick="window.location.reload()" style="padding: 12px 28px; background: #e50914; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600;">Retry</button>
        `;
    }
    if (heroButtons) heroButtons.style.display = 'none';
};

// Export functions for use in HTML onclick handlers
window.initApp = initApp;
window.scrollRow = scrollRow;
window.playHeroMovie = playHeroMovie;
window.showMoreInfo = showMoreInfo;
