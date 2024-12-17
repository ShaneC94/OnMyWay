const axios = require('axios');
const weatherModel = require('../models/weatherModel');
const tripModel = require('../models/tripModel');
const { WEATHER_API_KEY, WEATHER_API_BASE_URL } = require('../config/weatherConfig');

// Fetch weather data from external API and save to database
exports.updateWeather = async (req, res) => {
    try {
        const { cityId, cityName } = req.body; // Expect cityId and cityName from request

        // Construct API URL
        const apiUrl = `${WEATHER_API_BASE_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(cityName)}`;
        console.log('API URL:', apiUrl); // Debugging logs

        if (!WEATHER_API_BASE_URL || !WEATHER_API_KEY) {
            throw new Error('Weather API configuration (BASE_URL or API_KEY) is not set.');
        }

        // Fetch weather from API
        const response = await axios.get(apiUrl);
        const weatherData = response.data;

        // Map API response to database format
        const weatherRecord = {
            city_id: cityId,
            forecast_datetime: new Date(weatherData.location.localtime), // Combine date/time
            temperature: weatherData.current.temp_c, // Celsius temperature
            temperature_unit: 'C', // Default to Celsius
            weathercondition: weatherData.current.condition.text,
            icon_url: weatherData.current.condition.icon, // URL for weather icon
            humidity: weatherData.current.humidity || null, // Humidity percentage
            wind_speed: weatherData.current.wind_kph || null, // Wind speed in kph
            precipitation: weatherData.current.precip_mm || null, // Precipitation in mm
            forecast_type: 'current', // 'current' for real-time weather
        };

        // Save to database using weatherModel
        await weatherModel.saveWeather(weatherRecord);

        res.status(200).json({ success: true, message: 'Weather updated successfully.' });
    } catch (error) {
        console.error('Error updating weather:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update weather.' });
    }
};

// Retrieve weather data for a specific city
exports.getWeather = async (req, res) => {
    try {
        const { cityId } = req.params;

        // Fetch weather data from the database
        const weather = await weatherModel.getWeatherByCity(cityId);

        if (!weather) {
            return res.status(404).json({ success: false, message: 'Weather data not found.' });
        }

        res.status(200).json({ success: true, data: weather });
    } catch (error) {
        console.error('Error fetching weather:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather.' });
    }
};

// Load the page to select a city for weather
exports.selectCityWeather = async (req, res) => {
    try {
        const cities = await tripModel.getCities();
        res.render('selectCityWeather', { cities, error: null });
    } catch (error) {
        console.error('Error loading cities:', error.message);
        res.render('selectCityWeather', { cities: [], error: 'Failed to load cities. Please try again.' });
    }
};

// Load the page with the city, date, and time using /weather
exports.weatherPage = async (req, res) => {
    const city = req.query.city || 'Toronto'; // Default city
    const province = req.query.province || 'Ontario'; // Default province
    const country = req.query.country || 'Canada'; // Default country
    const date = req.query.date; // Date passed from query params
    const time = req.query.time; // Time passed from query params

    try {
        const weatherData = await weatherModel.fetchWeatherAndUpdateDB(city, province, country, date, time);

        res.render('weather', {
            weatherData,
            city,
            province,
            country,
            date,
            time,
            filteredForecast: weatherData,
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.render('weather', {
            weatherData: null,
            city,
            province,
            country,
            date,
            time,
            filteredForecast: null,
            error: 'Failed to fetch weather data. Please try again.',
        });
    }
};

// Fetch weather data from the API, called by /weather/data
exports.weather = async (req, res) => {
    const city = req.query.city || 'Toronto'; // Default city
    const province = req.query.province || 'Ontario'; // Default province
    const country = req.query.country || 'Canada'; // Default country
    const date = req.query.date; // Optional date
    const time = req.query.time; // Optional time

    try {
        const weatherData = await weatherModel.fetchWeatherAndUpdateDB(city, province, country, date, time);

        res.json({ success: true, weatherData });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch weather data. Please try again.' });
    }
};
