const db = require('../db'); // Database connection
const axios = require('axios');
const { WEATHER_API_KEY, WEATHER_API_BASE_URL } = require('../config/weatherConfig');

// Get weather data for a specific city
exports.getWeatherByCity = async (cityId) => {
    const query = `
        SELECT *
        FROM weather
        WHERE city_id = ?
        ORDER BY forecast_datetime DESC
        LIMIT 1
    `;
    try {
        const [rows] = await db.query(query, [cityId]);
        return rows[0];
    } catch (error) {
        console.error('Error fetching weather data for city:', error.message);
        throw error;
    }
};

// Save new weather data
exports.saveWeather = async (data) => {
    const query = `
        INSERT INTO weather (
            city_id, 
            forecast_datetime, 
            temperature, 
            temperature_unit, 
            weathercondition, 
            icon_url, 
            humidity, 
            wind_speed, 
            precipitation, 
            forecast_type, 
            last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            temperature = VALUES(temperature),
            temperature_unit = VALUES(temperature_unit),
            weathercondition = VALUES(weathercondition),
            icon_url = VALUES(icon_url),
            humidity = VALUES(humidity),
            wind_speed = VALUES(wind_speed),
            precipitation = VALUES(precipitation),
            forecast_type = VALUES(forecast_type),
            last_updated = NOW()
    `;
    const values = [
        data.city_id,
        data.forecast_datetime,
        data.temperature,
        data.temperature_unit || 'C',
        data.weathercondition,
        data.icon_url,
        data.humidity || null,
        data.wind_speed || null,
        data.precipitation || null,
        data.forecast_type || 'forecast',
    ];

    try {
        await db.query(query, values);
        console.log('Weather data saved successfully.');
    } catch (error) {
        console.error('Error saving weather data:', error.message);
        throw error;
    }
};

// Fetch weather data from the API and update the database
exports.fetchWeatherAndUpdateDB = async (city, province, country, date, time) => {
    try {
        const cleanCity = city.split(',')[0].trim(); // Extract the city name only
        console.log(`Querying database for city: ${cleanCity} ${province} ${country}`);

        // Query the city ID from the database
        const cityQuery = `
            SELECT id 
            FROM cities 
            WHERE city = ? AND province = ? AND country = ?
        `;
        const [cityRows] = await db.query(cityQuery, [cleanCity, province, country]);

        if (cityRows.length === 0) {
            throw new Error(`City '${cleanCity}, ${province}, ${country}' not found in the database.`);
        }

        const cityId = cityRows[0].id;

        // Format date and time for query
        const formattedDate = date; // `date` should already be in YYYY-MM-DD format
        const formattedTime = time.length === 5 ? `${time}:00` : time; // Ensure HH:MM:SS format

        // Check if fresh weather data already exists in the database
        const weatherQuery = `
            SELECT * 
            FROM weather 
            WHERE city_id = ? AND DATE(forecast_datetime) = ? AND TIME(forecast_datetime) = ?
            AND TIMESTAMPDIFF(SECOND, last_updated, NOW()) < 20
        `;
        const [weatherRows] = await db.query(weatherQuery, [cityId, formattedDate, formattedTime]);

        if (weatherRows.length > 0) {
            console.log('Using cached weather data from the database.');
            return weatherRows[0]; // Use cached data
        } else {
            console.log('No valid cached data found. Fetching from API...');
            // Fetch new data from the Weather API
            const queryString = `${cleanCity},${province},${country}`;
            const apiUrl = `${WEATHER_API_BASE_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(queryString)}&days=3&aqi=no&alerts=no`;

            const response = await axios.get(apiUrl);

            if (!response.data.forecast) {
                throw new Error('API response does not contain a forecast property');
            }

            const forecast = response.data.forecast.forecastday.find(f => f.date === date);

            if (!forecast) {
                throw new Error(`No forecast available for ${date}`);
            }

            // Find the closest time in the hourly forecast
            const hour = parseInt(time.split(':')[0], 10);
            const forecastHour = forecast.hour.find(h => parseInt(h.time.split(' ')[1].split(':')[0], 10) === hour);

            if (!forecastHour) {
                throw new Error(`No hourly data available for ${time}`);
            }

            const weatherData = {
                city_id: cityId,
                forecast_datetime: `${date} ${time}`,
                temperature: forecastHour.temp_c,
                temperature_unit: 'C',
                weathercondition: forecastHour.condition.text,
                icon_url: forecastHour.condition.icon,
                humidity: forecastHour.humidity || null,
                wind_speed: forecastHour.wind_kph || null,
                precipitation: forecastHour.precip_mm || null,
                forecast_type: 'forecast',
            };

            // Save new weather data to the database
            await this.saveWeather(weatherData);
            console.log('Weather data updated in the database');
            return weatherData;
        }
    } catch (error) {
        console.error('Error fetching and updating weather:', error.message);
        throw error;
    }
};
