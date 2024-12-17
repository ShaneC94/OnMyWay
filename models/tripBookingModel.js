// tripBookingModel.js
const db = require('../db');

const bookTrip = (tripId, passengerId, seatsTaken, callback) => {
    // Insert a new record into the 'trip_bookings' table

    console.log("In bookTrip");

    const insertString = "INSERT INTO trip_bookings (trip_id, passenger_id, seats_taken) VALUES (" + tripId +
                            ", " + passengerId + ", " + seatsTaken + ")";

    console.log(insertString);


    db.execute(insertString, [])
        .then(() => {
            callback(null, 'Seats booking successful.');
            //callback(true, 'Seats booking successful.');
        })
        .catch((error) => {
            callback('An error occurred during seats booking.');
        });

    /*
    db.query('INSERT INTO trip_bookings (trip_id, passenger_id, seatsTaken) VALUES (?, ?, ?)', [tripId, passengerId, seatsTaken], (error, results) => {
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
    });
    */


};

const deleteTripBooking = (tripId, callback) => {
    var deleteString = "DELETE FROM trip_bookings WHERE trip_id = " + tripId + ";";

    console.log(deleteString);

    db.execute( deleteString , [])
        .then(() => {
            callback(true);  // success
        })
        .catch((error) => {
            console.log(error);
            callback(false); // not success
        });
};

module.exports = {
    bookTrip,
    deleteTripBooking
};
