/**
 * @file userRoutes.js
 * @description This file contains a route handler for selecting user roles and redirecting 
 * users to their respective dashboards based on the selected role.
 */
const express = require('express');
const router = express.Router();

router.get('/selectRole', (req, res) => res.render('userSelection'));

router.post('/selectRole', (req, res) => {
    /**
     * Route handler for processing user role selection
     */
    const selectedRole = req.body.role;

    if (selectedRole === 'driver') {
        // Driver
        res.redirect('/driver/dashboard');

    } else if (selectedRole === 'passenger') {
        // Passenger
        res.redirect('/passenger/dashboard');
    } else {
        // Invalid selection (idk how this even happens...)
        res.redirect('/');
    }
});

module.exports = router;