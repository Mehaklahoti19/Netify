/**
 * Movies Routes Module
 * 
 * Handles movie data fetching from OMDb API.
 * Acts as a proxy to protect the API key and format responses.
 * Note: OMDb API works differently from TMDB - it uses search by title/ID
 * rather than categories like popular/top_rated.
 */

const express = require('express');
const axios = require('axios');

const router = express.Router();

// OMDb API Configuration
const OMDB_BASE_URL = 'http://www.omdbapi.com';
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Sample movie titles for different categories
// OMDb doesn't have category endpoints like TMDB, so we use popular titles
const MOVIE_LISTS = {
    popular: [
        'Inception', 'The Dark Knight', 'Interstellar', 'Avengers Endgame',
        'Avatar', 'Titanic', 'The Matrix', 'Forrest Gump',
        'Pulp Fiction', 'The Shawshank Redemption', 'Fight Club', 'Goodfellas',
        'The Godfather', 'The Lord of the Rings', 'Inception', 'Django Unchained'
    ],
    top_rated: [
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', '12 Angry Men',
        'Schindler\'s List', 'The Lord of the Rings', 'Pulp Fiction', 'Inception',
        'Fight Club', 'Forrest Gump', 'The Matrix', 'Goodfellas',
        'One Flew Over the Cuckoo\'s Nest', 'Seven', 'Se7en', 'The Silence of the Lambs'
    ],
    upcoming: [
        'Dune Part Two', 'Deadpool 3', 'Joker 2', 'Gladiator 2',
        'Avatar 3', 'Mission Impossible', 'Fast X', 'The Marvels',
        'Aquaman 2', 'Wonka', 'The Hunger Games', 'Napoleon',
        'Wish', 'Migration', 'Anyone But You', 'The Color Purple'
    ]
};

/**
 * Helper function to make OMDb API requests
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - API response data
 */
const fetchFromOMDB = async (params = {}) => {
    try {
        const response = await axios.get(OMDB_BASE_URL, {
            params: {
                apikey: OMDB_API_KEY,
                ...params
            }
        });
        
        // OMDb returns { Response: "False", Error: "..." } for errors
        if (response.data.Response === 'False') {
            throw new Error(response.data.Error || 'OMDb API Error');
        }
        
        return response.data;
    } catch (error) {
        console.error('OMDb API Error:', error.message);
        throw error;
    }
};

/**
 * Helper function to format movie data from OMDb to match our frontend format
 * @param {object} movie - Raw movie data from OMDb
 * @returns {object} - Formatted movie object
 */
const formatMovie = (movie) => {
    // Parse rating from string (e.g., "8.8/10" -> 8.8)
    let rating = null;
    if (movie.imdbRating && movie.imdbRating !== 'N/A') {
        rating = parseFloat(movie.imdbRating);
    }
    
    // Parse year
    let year = null;
    if (movie.Year && movie.Year !== 'N/A') {
        year = movie.Year;
    }
    
    return {
        id: movie.imdbID || movie.Title,
        title: movie.Title,
        overview: movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No description available.',
        posterPath: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null,
        backdropPath: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null,
        releaseDate: year,
        rating: rating,
        voteCount: movie.imdbVotes ? parseInt(movie.imdbVotes.replace(/,/g, '')) : null,
        genre: movie.Genre || '',
        runtime: movie.Runtime,
        director: movie.Director,
        actors: movie.Actors
    };
};

/**
 * Fetch multiple movies by their titles
 * @param {array} titles - Array of movie titles
 * @returns {Promise<array>} - Array of formatted movie objects
 */
const fetchMoviesByTitles = async (titles) => {
    const movies = [];
    
    // Fetch movies in parallel with a limit
    const promises = titles.map(async (title) => {
        try {
            const data = await fetchFromOMDB({ t: title, type: 'movie' });
            if (data && data.Title) {
                return formatMovie(data);
            }
        } catch (error) {
            console.warn(`Failed to fetch movie: ${title}`, error.message);
            return null;
        }
    });
    
    const results = await Promise.all(promises);
    return results.filter(movie => movie !== null);
};

/**
 * GET /api/movies/popular
 * Fetch popular movies from OMDb
 */
router.get('/popular', async (req, res) => {
    try {
        // Check if OMDb API key is configured
        if (!OMDB_API_KEY || OMDB_API_KEY === 'your-omdb-api-key') {
            return res.status(500).json({
                success: false,
                message: 'OMDb API key not configured'
            });
        }

        const movies = await fetchMoviesByTitles(MOVIE_LISTS.popular);

        res.json({
            success: true,
            page: 1,
            totalPages: 1,
            totalResults: movies.length,
            movies: movies
        });

    } catch (error) {
        console.error('Error fetching popular movies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular movies'
        });
    }
});

/**
 * GET /api/movies/top_rated
 * Fetch top rated movies from OMDb
 */
router.get('/top_rated', async (req, res) => {
    try {
        if (!OMDB_API_KEY || OMDB_API_KEY === 'your-omdb-api-key') {
            return res.status(500).json({
                success: false,
                message: 'OMDb API key not configured'
            });
        }

        const movies = await fetchMoviesByTitles(MOVIE_LISTS.top_rated);

        res.json({
            success: true,
            page: 1,
            totalPages: 1,
            totalResults: movies.length,
            movies: movies
        });

    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top rated movies'
        });
    }
});

/**
 * GET /api/movies/upcoming
 * Fetch upcoming movies from OMDb
 */
router.get('/upcoming', async (req, res) => {
    try {
        if (!OMDB_API_KEY || OMDB_API_KEY === 'your-omdb-api-key') {
            return res.status(500).json({
                success: false,
                message: 'OMDb API key not configured'
            });
        }

        const movies = await fetchMoviesByTitles(MOVIE_LISTS.upcoming);

        res.json({
            success: true,
            page: 1,
            totalPages: 1,
            totalResults: movies.length,
            movies: movies
        });

    } catch (error) {
        console.error('Error fetching upcoming movies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming movies'
        });
    }
});

/**
 * GET /api/movies/now_playing
 * Fetch now playing movies from OMDb (using popular as fallback)
 */
router.get('/now_playing', async (req, res) => {
    try {
        if (!OMDB_API_KEY || OMDB_API_KEY === 'your-omdb-api-key') {
            return res.status(500).json({
                success: false,
                message: 'OMDb API key not configured'
            });
        }

        // OMDb doesn't have a now_playing endpoint, use popular as fallback
        const movies = await fetchMoviesByTitles(MOVIE_LISTS.popular.slice(0, 8));

        res.json({
            success: true,
            page: 1,
            totalPages: 1,
            totalResults: movies.length,
            movies: movies
        });

    } catch (error) {
        console.error('Error fetching now playing movies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch now playing movies'
        });
    }
});

/**
 * GET /api/movies/search
 * Search movies by query string
 */
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        if (!OMDB_API_KEY || OMDB_API_KEY === 'your-omdb-api-key') {
            return res.status(500).json({
                success: false,
                message: 'OMDb API key not configured'
            });
        }

        // OMDb search returns a list, we need to fetch details for each
        const searchData = await fetchFromOMDB({ s: query, type: 'movie', page: req.query.page || 1 });
        
        let movies = [];
        if (searchData.Search && Array.isArray(searchData.Search)) {
            // Fetch full details for each movie (limited to first 8 for performance)
            const limitedResults = searchData.Search.slice(0, 8);
            const moviePromises = limitedResults.map(async (item) => {
                try {
                    const details = await fetchFromOMDB({ i: item.imdbID });
                    return formatMovie(details);
                } catch (error) {
                    console.warn(`Failed to fetch details for: ${item.imdbID}`);
                    return null;
                }
            });
            
            const results = await Promise.all(moviePromises);
            movies = results.filter(movie => movie !== null);
        }

        res.json({
            success: true,
            page: parseInt(req.query.page) || 1,
            totalPages: Math.ceil((searchData.totalResults || 0) / 10),
            totalResults: parseInt(searchData.totalResults) || 0,
            movies: movies
        });

    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search movies'
        });
    }
});

/**
 * GET /api/movies/:id
 * Fetch movie details by IMDB ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!OMDB_API_KEY || OMDB_API_KEY === 'your-omdb-api-key') {
            return res.status(500).json({
                success: false,
                message: 'OMDb API key not configured'
            });
        }

        const data = await fetchFromOMDB({ i: id });
        const movie = formatMovie(data);

        res.json({
            success: true,
            movie: movie
        });

    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch movie details'
        });
    }
});

module.exports = router;
