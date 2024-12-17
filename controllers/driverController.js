/**
 * @file driverController.js
 * @description Controller for handling driver requests
 */
const tripModel = require('../models/tripModel');
const tripBookingModel = require('../models/tripBookingModel');


/**
 * @function tripsAvailableForDriver
 * @description Display all trip requests for a driver on the driver dashboard page
 */
const tripsAvailableForDriver = async (req, res) => {
    try {
        const availableTrips = await tripModel.getTripsAvailableForDriver();
        const vehicleTypes = await tripModel.getVehicleTypes(); // Fetch vehicle types

        res.render('driverDashboard', { availableTrips, vehicleTypes, error: null });
    } catch (error) {
        res.render('driverDashboard', { availableTrips: [], vehicleTypes: [], error: error.message });
    }
};

/**
 * @function driverSelectTrip
 * @description Process the driver selecting a trip request
 */
const driverSelectTrip = (req, res) => {
    console.log("In driverSelectTrip");

    const tripId = req.params.tripId;
    const passengerId = req.params.reqId;       // passenger is the requester
    const seatsTaken = req.params.seatsAvail;   // seatsTaken = seatsRequired because requester won't ask for more seats then they need
    const vehicleType = req.params.vehicleType; 
    const driverId = req.session.userId;        // driver is the current user
 

    console.log("added - driverController.driverSelectTrip");
    console.log("tripId = " + tripId);
    console.log("passengerId (requestor ) = " + passengerId);
    console.log("seatsTaken = " + seatsTaken);
    console.log("driver Id (login now) = " + driverId);
    console.log("vehicleType = " + vehicleType);

    // Call the model to update the request's driver id from 0 to the current user id (driverId = 0 when the trip has no driver) and change the status to 'full',
    // then add a new trip booking record for the passenger, and display flash message based on success or failure
    tripModel.updateDriverSelectTrip(tripId, driverId, passengerId, vehicleType , (success) => {
        if (success) {
            console.log("calling tripBookModel.bookTrip: " + tripId, " passengerId = " +
                passengerId + "seatsTaken = " + seatsTaken);

            tripBookingModel.bookTrip(tripId, passengerId, seatsTaken, (error, message) => {
                if (error) {
                    req.flash('error', error);
                } else {
                    req.flash('message', message);
                }
                res.redirect('/driver/dashboard');
            });
        } else {
            req.flash('error', 'An error occurred during seats booking.');
            res.redirect('/driver/dashboard');
        }
    });
};


/**
 * @function displayDriverConfirmedBookings
 * @description Display all confirmed trips for a driver on the driver confirmed bookings page
 */
const displayDriverConfirmedBookings = async (req, res) => {
    const driverId = req.session.userId;

    try {
        const confirmedBookings = await tripModel.getDriverConfirmedBookings( driverId);
        res.render('driverConfirmed', { confirmedBookings, error: null });
    } catch (error) {
        res.render('driverConfirmed', { confirmedBookings: [], error: error.message });
    }
};


/**
 * @function displayDriverRequestedBookings
 * @description Display all trips posted by a driver on the driver requested bookings page
 */
const displayDriverRequestedBookings = async (req, res) => {
    const driverId = req.session.userId;

    try {
        const requestedBookings = await tripModel.getDriverRequestedBookings(driverId);
        res.render('driverRequested', { requestedBookings, error: null });
    } catch (error) {
        res.render('driverRequested', { requestedBookings: [], error: error.message });
    }
};


/**
 * @function driverReq
 * @description Display the driver request page (for creating a new trip)
 */
const driverReq = async (req, res) => {
    try {
        const cities = await tripModel.getCities();
        const vehicleTypes = await tripModel.getVehicleTypes(); // Fetch vehicle types
        const fees = await tripModel.getFees(); // Fetch fees

        // Create a 2D fee array indexed from 1 to maxCities
        const maxCities = cities.length; // Assuming city IDs are 1-based and sequential
        const feeArray = Array.from({ length: maxCities + 1 }, () => Array(maxCities + 1).fill(0));

        // Populate the fee array
        fees.forEach(fee => {
            feeArray[fee.from_city][fee.to_city] = fee.fee;
        });

        //console.log(feeArray); // Check what’s being sent to the template
        
        res.render('driverReq', { cities, feeArray, vehicleTypes, error: null });
    } catch (error) {
        console.log("driverReq error = " + error);
        res.render('driverReq', { cities: [], feeArray: [], vehicleTypes: [], error: error.message });
    }
};


/**
 * @function processDriverReq
 * @description Process the driver creating a new trip
 */
const processDriverReq = (req, res) => {
    const { inputDate, inputTime, inputFrom, inputTo, inputSeats, vehicleType, fee } = req.body;

    console.log("driverController.processDriverReq");
    console.log("inputDate = " + inputDate);
    console.log("inputTime = " + inputTime);
    console.log("inputFrom = " + inputFrom);
    console.log("inputTo   = " + inputTo);
    console.log("inputSeats = " + inputSeats);
    console.log("vehicleType = " + vehicleType);
    console.log("fee = " + fee);

    const requestDriverId = req.session.userId; 

    console.log("requestDriverId = " + requestDriverId);

    tripModel.processDriverReq(inputDate, inputTime, inputFrom, inputTo, inputSeats,
        requestDriverId, vehicleType, fee, (error, message) => {
            if (error) {
                console.log("tripModel.processDriverReq(), error = " + error);
                req.flash('error', error);
                res.redirect('/driver/request');
            }
            else {
                console.log("tripModel.processDriverReq(), tripId = ", message);
                req.flash('message', 'Trip request added.');
                res.redirect('/driver/request');
            }
        });
};


module.exports = {
    tripsAvailableForDriver,
    driverSelectTrip,

    displayDriverConfirmedBookings,
    
    displayDriverRequestedBookings,

    driverReq,
    processDriverReq
};
