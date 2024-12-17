// controllers/adminController.js
const userModel = require('../models/userModel');
const tripModel = require('../models/tripModel');
const tripBookingModel = require('../models/tripBookingModel');
const { parse } = require('json2csv');

/**
 * @function adminPage
 * @description Display the admin page, if not admin, redirect to login
 */
const adminPage = (req, res) => {
    if ( req.session.admin == 'Y' || req.session.admin == 'y')
        res.render('adminPage');
    else
    {
        console.log("not admin, go to login");
        res.redirect('/login');
    }
};

/**
 * @function processAdminPage
 * @description Process the admin page actions (export database or delete trip or statistics)
 */
const processAdminPage = async (req, res) => {
    const { adminAction } = req.body;
    console.log(adminAction); // Will log either "exportdb" or "deleteTrip" based on the selection

    // Handle different actions based on adminAction
    if (adminAction === 'exportDb') {

        try {
            const results = await userModel.exportDb();
            console.log(results);

            // Convert MySQL data to CSV
            const csv = parse(results);

            // Set response headers for file download
            res.header('Content-Type', 'text/csv');
            res.attachment('USERS.csv');
            res.send(csv);
        } catch (error) {
            console.error("Error exporting data:", error);
            res.render('adminPage', { error: 'Error exporting data.' });
        }

    } else if (adminAction === 'deleteTrip') {
        // Code to delete a trip
        res.redirect('/adminPage/deleteTrip');
    } else if (adminAction === 'statistics') {
        // Code to display statistics
        res.redirect('/adminPage/statistics');
    } else {
        console.log("No action selected.");
    }
};

/**
 * @function deleteTrip
 * @description Display the "sort by" for deleting trips
 */
const deleteTrip = (req, res) => {
    res.render('deleteTrip');
}

/**
 * @function processDeleteTrip
 * @description Display all trips sorted by criteria based on the "sort by" selection
 */
const processDeleteTrip = async (req, res) => {
    const { sortBy } = req.body;
    console.log(sortBy);

    try {
        const availableTrips = await tripModel.getDeleteTrips(sortBy);
        res.render('deleteTripDisplay', { availableTrips, error: null });
    } catch (error) {
        res.render('deleteTripDisplay', { availableTrips: [], error: error.message });
    }
};


/**
 * @description Process the deletion of a trip after selecting a trip to delete
 */
const processDeleteTripDisplay = (req, res) => {
    const tripId = req.params.tripId;
    
    // Update the seats used and create a new trip booking record
        tripBookingModel.deleteTripBooking(tripId, (success) => {
        if (success)
        {
            tripModel.deleteTrip(tripId, (error, message) => {
                if (error) {
                    req.flash('error', error);
                } else {
                    req.flash('message', message);
                }
                //res.render('/adminPage/deleteTrip', {message: 'Successfully deleted trip.'});
                res.redirect('/adminPage/deleteTrip');    // Redirect to the deleteTrip
            });
        } else {
            req.flash('error', 'An error occurred during deletion.');
            res.redirect('/adminPage/deleteTrip');
        }
    });
};


/**
 * @description process create of a chart of most common cities
 */
const processStats = async (req, res) => {
    const { adminAction } = req.body;
    console.log(adminAction); // Will log either "exportdb" or "deleteTrip" based on the selection

    // Call the model to get the data
    try {
        const cityCount = await tripModel.getCitiesCount();
        res.render('statistics', { cityCount, error: null });
    } catch (error) {
        res.render('statistics', { cityCount: [], error: error.message });
    }
};


module.exports = {
    adminPage,

    processAdminPage,

    deleteTrip,
    processDeleteTrip,
    processDeleteTripDisplay,

    processStats
};
