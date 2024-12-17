const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Render the weather page
router.get('/', weatherController.weatherPage); // Renders weather.ejs with data

// Render the selectCityWeather page
router.get('/select', weatherController.selectCityWeather);

// API route to fetch weather data as JSON
router.get('/data', weatherController.weather); // For dynamic updates via fetch()

// Fetch weather data for a specific city by cityId
router.get('/:cityId', weatherController.getWeather);

// Update weather data for a city
router.post('/update', weatherController.updateWeather);

module.exports = router;
