/**
 * @file passengerRoutes.js
 * @description This file handles all passenger routes
 * It includes routes for displaying the passenger dashboard, selecting trips, viewing confirmed bookings, viewing requested trips, and requesting a trip.
 * All routes require authentication.
 */

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const passengerController = require('../controllers/passengerController');

// Passenger dashboard (view available trips)
router.get('/dashboard', requireAuth, passengerController.displayAvailableTrips);

// Passenger selects a specific trip to view details
router.get('/selectTrip/:tripId/:seatsTaken/:seatsAvail', requireAuth, passengerController.processSelectTrip);

// Confirmed bookings for passenger
router.get('/confirmed', requireAuth, passengerController.displayConfirmedBookings);

// Passenger requested trips
router.get('/requests', requireAuth, passengerController.displayRequestedBookings);

// Passenger request trip page
router.get('/request', requireAuth, passengerController.passengerReq);
router.post('/request', requireAuth, passengerController.processPassengerReq);

module.exports = router;
