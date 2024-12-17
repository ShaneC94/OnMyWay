/**
 * @file authRoutes.js
 * @description This file contains the routes for user authentication including registration, login, and logout.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register
router.get('/register', userController.registerUser);
router.post('/register', userController.processRegistration);

// Login
router.get('/login', userController.loginUser);
router.post('/login', userController.processLogin);

// Logout
router.get('/logout', (req, res) => {
    // Destroy the session and redirect to login
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

module.exports = router;