/**
 * @file adminRoutes.js
 * @description This file contains the routes for the admin section of the application. 
 * It includes routes for displaying the admin page, admin actions such as exporting data and deleting trips.
 * All routes require authentication.
 */
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Admin dashboard
router.get('/', requireAuth, adminController.adminPage);
router.post('/', requireAuth, adminController.processAdminPage);

// Delete trip page
router.get('/deleteTrip', requireAuth, adminController.deleteTrip);
router.post('/deleteTrip', requireAuth, adminController.processDeleteTrip);
router.get('/processDeleteTripDisplay/:tripId', requireAuth, adminController.processDeleteTripDisplay);

// Chart of most common cities
router.get('/statistics', requireAuth, adminController.processStats);

module.exports = router;