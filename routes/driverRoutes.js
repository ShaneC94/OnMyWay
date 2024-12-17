/**
 * @file driverRoutes.js
 * @description This file contains the routes for the driver section of the application.
 * It includes routes for displaying the driver dashboard, selecting trips, viewing confirmed bookings, viewing posted rides, and posting a trip.
 * All routes require authentication.
 */
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const driverController = require('../controllers/driverController');

// Driver dashboard (view available trips)
router.get('/dashboard', requireAuth, driverController.tripsAvailableForDriver);

// Driver accepts a trip request
router.get('/selectTrip/:tripId/:reqId/:seatsAvail/:vehicleType', requireAuth, driverController.driverSelectTrip);

// Confirmed bookings for driver
router.get('/confirmed', requireAuth, driverController.displayDriverConfirmedBookings);

// Driver posted rides
router.get('/requests', requireAuth, driverController.displayDriverRequestedBookings);

// Display request page
router.get('/request', requireAuth, driverController.driverReq);
router.post('/request', requireAuth, driverController.processDriverReq);

module.exports = router;