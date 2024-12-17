/**
 * @file passengerController.js
 * @description Controller for handling passenger requests
 */
const tripModel = require('../models/tripModel');
const tripBookingModel = require('../models/tripBookingModel');


/**
 * @function displayAvailableTrips
 * @description Display all available trips for a passenger on the passenger dashboard page
 */
const displayAvailableTrips = async (req, res) => {
    try {
        const availableTrips = await tripModel.getAvailableTrips();
        res.render('passengerDashboard', { availableTrips, error: null });
    } catch (error) {
        res.render('passengerDashboard', { availableTrips: [], error: error.message });
    }
};

/**
 * @function selectTrip
 * @description Process the passenger selecting a trip
 */
const processSelectTrip = (req, res) => {
    console.log("In selectTrip");

    const tripId = req.params.tripId;
    const seatsTaken = req.params.seatsTaken;
    const seatsAvail = req.params.seatsAvail;
    const passengerId = req.session.userId;

    console.log("tripId = " + tripId);
    console.log("seatsTaken = " + seatsTaken);
    console.log("passengerId = " + passengerId);
    console.log("seatsAvail = " + seatsAvail);

    // Call the model to update the seats used, and display flash message based on success or failure,
    // then add a new trip booking record, and display flash message based on success or failure
    tripModel.updateSeatsUsed(tripId, passengerId, seatsTaken, seatsAvail, (success) => {
        if (success)
        {
            console.log("calling tripBookModel.bookTrip: " + tripId, " passengerId = "+ passengerId + "seatsTaken = " + seatsTaken);

            tripBookingModel.bookTrip(tripId, passengerId, seatsTaken, (error, message) => {
                if (error) {
                    req.flash('error', error);
                } else {
                    req.flash('message', message);
                }
                res.redirect('/passenger/dashboard');
            });
        } else {
            req.flash('error', 'An error occurred during seats booking.');
            res.redirect('/passenger/dashboard');
        }
    });
};


/**
 * @function displayConfirmedBookings
 * @description Displays all confirmed bookings for a passenger on the passenger confirmed trips page
 */
const displayConfirmedBookings = async (req, res) => {
    const passengerId = req.session.userId;

    try {
        const confirmedBookings = await tripModel.getConfirmedBookings( passengerId );
        res.render('passengerConfirmed', { confirmedBookings, error: null });
    } catch (error) {
        res.render('passengerConfirmed', { confirmedBookings: [], error: error.message });
    }
};


/**
 * @function displayRequestedBookings
 * @description Displays all requested bookings for a passenger on the passenger requested trips page
 */
const displayRequestedBookings = async (req, res) => {
    const passengerId = req.session.userId;

    try {
        const requestedBookings = await tripModel.getRequestedBookings(passengerId);
        res.render('passengerRequested', { requestedBookings, error: null });
    } catch (error) {
        res.render('passengerRequested', { requestedBookings: [], error: error.message });
    }
};


/**
 * @function passengerReq
 * @description Displays the passenger request page (for making trip requests)
 */
const passengerReq = async (req, res) => {

    try {
        const cities = await tripModel.getCities();
        const vehicleTypes = await tripModel.getVehicleTypes(); // Assume this method gets vehicle types
        const fees = await tripModel.getFees(); // Fetch fees

        // Create a 2D fee array indexed from 1 to maxCities
        const maxCities = cities.length; // Assuming city IDs are 1-based and sequential
        const feeArray = Array.from({ length: maxCities + 1 }, () => Array(maxCities + 1).fill(0));

        // Populate the fee array
        fees.forEach(fee => {
            feeArray[fee.from_city][fee.to_city] = fee.fee;
        });

        //console.log(feeArray); // Check what’s being sent to the template
        
        res.render('passengerReq', { cities, feeArray, vehicleTypes, error: null });
    } catch (error) {
        console.log("driverReq error = " + error);
        res.render('passengerReq', { cities: [], feeArray: [], vehicleTypes: [], error: error.message });
    }

};


/**
 * @function processPassengerReq
 * @description Processes the passenger request for a new trip
 */
const processPassengerReq = (req, res) => {
    const { inputDate, inputTime, inputFrom, inputTo, inputSeats, fee } = req.body;

    console.log("passengerController.processPassengerReq");
    console.log("inputDate = " + inputDate);
    console.log("inputTime = " + inputTime);
    console.log("inputFrom = " + inputFrom);
    console.log("inputTo   = " + inputTo);
    console.log("inputSeats = " + inputSeats);
    console.log("fee = " + fee);

    const requestPassangerId = req.session.userId;

    console.log("requestPassangerId = " + requestPassangerId);

    // Call the model to add the trip request, display flash message based on success or failure
    tripModel.processPassengerReq(inputDate, inputTime, inputFrom, inputTo, inputSeats,
                                    requestPassangerId, fee, (error, message) => {
        if (error) {
            console.log("tripModel.processPassengerReq(), error = " + error);
            req.flash('error', error );
            res.redirect('/passenger/requests');
        }
        else{
            console.log("tripModel.processPassengerReq(), tripId = ", message);
            req.flash('message', 'Trip request added.');
            res.redirect('/passenger/requests');
        }
    });
};


module.exports = {
    displayAvailableTrips,
    processSelectTrip,

    displayConfirmedBookings,
    passengerReq,

    processPassengerReq,
    displayRequestedBookings
};
