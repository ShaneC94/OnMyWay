/**
 * @file app.js
 * @description Main file for the application. This file is responsible for setting up the server and routing.
 */
const express = require('express');
const db = require('./db');                                     // Database connection module
const sessionConfig = require('./config/sessionConfig');        // Session configuration
const authRoutes = require('./routes/authRoutes');              // Authentication routes
const userRoutes = require('./routes/userRoutes');              // User routes
const adminRoutes = require('./routes/adminRoutes');            // Admin routes
const passengerRoutes = require('./routes/passengerRoutes');    // Passenger routes
const driverRoutes = require('./routes/driverRoutes');          // Driver routes
const weatherRoutes = require('./routes/weatherRoutes');        // Weather routes
const cookieParser = require('cookie-parser');                  // Cookie parser
const flash = require('express-flash');                         // Flash messages
const bodyParser = require('body-parser');                      // Request body parser

// Create express app with ejs as view engine
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionConfig(db));

app.use(flash());
app.use((req, res, next) => {
    /**
     * Custom middleware that allows flash messages and usernames available to all views
     */
    res.locals.message = req.flash();
    res.locals.username = req.session.username;
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/adminPage', adminRoutes);
app.use('/driver', driverRoutes);   
app.use('/passenger', passengerRoutes);
app.use('/weather', weatherRoutes);
app.use('/user', userRoutes);

// Default page is login page
app.get('/', (req, res) => {
    res.render('login');
});

// About page
app.get('/about', function (req, res) {
    res.render('about');
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000 or process.env.PORT');
});