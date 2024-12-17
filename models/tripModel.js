// tripModel.js
const db = require('../db');

const availableTripsQuery = 
    "select tr.id, date_format(departure_date, '%Y-%m-%d') as d_date, time_format(departure_time, '%h:%i %p') as d_time, " +
    "f.city as from_city, t.city as to_city, seats_available, vehicle_type, fee, " +
    "username as driver from trips tr, cities f, cities t, users u ,  vehicles v WHERE status = 'available' and driver_id = u.id " +
    "and f.id = departure_location and t.id = arrival_location and tr.vehicle_type_id = v.id order by d_date asc, d_time asc";

// clean up without wrapping with Promise
const getAvailableTrips = async () => {
    try {
        const [results] = await db.execute(availableTripsQuery);
        return results;
    } catch (error) {
        throw error;
    }
};

// clean up without wrapping with Promise
const getConfirmedBookings = async (passengerId) => {
    const confirmedBookingsQuery =
        "select tr.id, date_format(departure_date, '%Y-%m-%d') as d_date, time_format(departure_time, '%h:%i %p') as d_time, " +
        "f.city as from_city, t.city as to_city, seats_available, SUM(seats_taken) as seats_taken_sum, " +
        "username as driver, vehicle_type, fee from trips tr, cities f, cities t, users u, trip_bookings tb, vehicles v " +
        "WHERE status <> 'pending' and driver_id = u.id and f.id = departure_location and t.id = arrival_location " +
        "and tr.id = tb.trip_id and tb.passenger_id = " + passengerId + " and tr.vehicle_type_id = v.id group by tb.trip_id " + 
        "order by d_date asc, d_time asc";

    /// ============= need to set user move user here 
    try {
        const [results] = await db.execute(confirmedBookingsQuery);
        return results;
    } catch (error) {
        throw error;
    }
};


// Return requested bookings
const getRequestedBookings = async (requestorId) => {

    const requestedBookingsQuery =
        "select tr.id, date_format(departure_date, '%Y-%m-%d') as d_date, time_format(departure_time, '%h:%i %p') as d_time, " +
        "f.city as from_city, t.city AS to_city, seats_available, fee, " +
        "username as req_name from trips tr, cities f, cities t, users u " +
        "WHERE status = 'pending' and req_id = u.id and f.id = departure_location and t.id = arrival_location " +
        "AND req_id = " + requestorId + 
        " order by d_date asc, d_time asc";

    /// ============= need to set user move user here 
    try {
        const [results] = await db.execute(requestedBookingsQuery);
        return results;
    } catch (error) {
        throw error;
    }
};


// use then and catch
const processPassengerReq = (inputDate, inputTime, inputFrom, inputTo, inputSeats, requestPassangerId, fee, callback) => {

    console.log("tripModel.ProcessPassengerReq");
    console.log("inputDate = " + inputDate);
    console.log("inputTime = " + inputTime);
    console.log("inputFrom = " + inputFrom);
    console.log("inputTo   = " + inputTo);
    console.log("inputSeats = " + inputSeats);
    console.log("requestPassangerId = " + requestPassangerId);
    console.log("fee = " + fee);

    // driver not assigned, put in value 0, req_id = requestPassangerId
    var insertString = "INSERT INTO trips (driver_id, req_id, departure_location, arrival_location, " +
        "departure_date, departure_time, seats_available, fee, status) " +
        "VALUES(0, " + requestPassangerId + ", " + inputFrom + ", " + inputTo + ", '" +
        inputDate + "', '" + inputTime + "', " + inputSeats + ", " + fee +
        " , 'pending');";

    console.log(insertString);

    // callback - (error, message)
    db.execute(insertString, [])
        .then((results) => {
            const tripId = results[0].insertId;
            console.log( "tripId = " + tripId );
            callback( null, results[0].insertId ); // (error=null, tripId)
        })
        .catch((error) => {
            console.log("Error in tripModel.js, " + error);
            callback("Error during trip request - " + eror , null);
        });
};


const updateSeatsUsed = (tripId, passengerId, seatsTaken, seatsAvail, callback) => {

    var updateString = "";
    var seatsAvailUpdate = 0;


    //console.log("In updateSeatsUsed");
    //console.log("tripId = " + tripId);
    //console.log("seatsTaken = " + seatsTaken);
    //console.log("passengerId = " + passengerId);
    //console.log("seatsAvail = " + seatsAvail);

    if (seatsAvail > seatsTaken)
    {
        seatsAvailUpdate = seatsAvail - seatsTaken;

    }
    else
    {
        seatsAvailUpdate = 0;
    }

 //   console.log(seatsAvailUpdate + " : " + status);

    if (seatsAvailUpdate == 0)
        updateString = "UPDATE trips SET seats_available = 0, status = 'full' WHERE id = " + tripId;
    else
        updateString = "UPDATE trips SET seats_available = " + seatsAvailUpdate + 
                       " WHERE id = " + tripId;

    console.log(updateString);

    // parameter in updateString
    db.execute( updateString , [])
        .then(() => {
            callback(true);  // success
        })
        .catch((error) => {
            console.log(error);
            callback(false); // not success
        });
};

///////////////////////////
// driver
////////////////////////

const availableTripsForDriver =
    "select tr.id, date_format(departure_date, '%Y-%m-%d') as d_date, time_format(departure_time, '%h:%i %p') as d_time, " +
    "f.city as from_city, t.city as to_city, seats_available, " +
    "req_id, username as req_name, fee from trips tr, cities f, cities t, users u WHERE status = 'pending' and req_id = u.id " +
    "and f.id = departure_location and t.id = arrival_location order by d_date asc, d_time asc";


// use async
const getTripsAvailableForDriver = async () => {
    try {
        const [results] = await db.execute(availableTripsForDriver);
        return results;
    } catch (error) {
        throw error;
    }
};


const updateDriverSelectTrip = (tripId, driverId, passengerId, vehicleType, callback) => {

    var updateString = "UPDATE trips SET driver_id = " + driverId +
        ", seats_available = 0, status = 'full' , vehicle_type_id = " + vehicleType + " WHERE id = " + tripId;

    console.log(updateString);

    db.execute(updateString, [])
        .then(() => {
            callback(true);
            //callback(true, 'Seats booking successful.');
        })
        .catch((error) => {
            callback(false);
            //callback(false, 'An error occurred during seats booking.');
        });

};


const getDriverConfirmedBookings = async (driverId) => {

    const driverConfirmedBookingsQuery =
        "select tr.id, date_format(departure_date, '%Y-%m-%d') as d_date, time_format(departure_time, '%h:%i %p') as d_time, " +
        "f.city as from_city, t.city as to_city, seats_available, SUM(seats_taken) as seats_taken_sum, " +
        "(select group_concat(DISTINCT u.username separator ', ') from users u, trip_bookings tb where tb.trip_id = tr.id and u.id = tb.passenger_id ) as passengers, " +
        "username as driver, fee, v.vehicle_type " +
        "from trips tr, cities f, cities t, users u, trip_bookings tb, vehicles v " +
        "WHERE status <> 'pending' " +
        "AND tr.driver_id = u.id " + 
        "AND f.id = departure_location " +
        "AND t.id = arrival_location " +
        "AND tr.id = tb.trip_id " +
        "AND tr.driver_id = " + driverId + 
        " AND tr.vehicle_type_id = v.id " +
        "GROUP BY tb.trip_id ORDER BY d_date ASC, d_time ASC"	

    try {
        const [results] = await db.execute(driverConfirmedBookingsQuery);
        return results;
    } catch (error) {
        throw error;
    }
};

// Return requested bookings for driver
const getDriverRequestedBookings = async (driverId) => {

    const driverRequestedBookingsQuery =
        "select tr.id, date_format(departure_date, '%Y-%m-%d') as d_date, time_format(departure_time, '%h:%i %p') as d_time, " +
        "f.city as from_city, t.city AS to_city, seats_available, " +
        "username as driver_name, vehicle_type, fee " +
        "from trips tr, cities f, cities t, users u, vehicles v " +
        "WHERE status = 'available' and driver_id = u.id and f.id = departure_location and t.id = arrival_location " +
        "AND driver_id = " + driverId + " AND tr.vehicle_type_id = v.id AND tr.id NOT IN(SELECT distinct trip_id FROM trip_bookings) " +
        " order by d_date asc, d_time asc";
 
    try {
        const [results] = await db.execute(driverRequestedBookingsQuery);
        return results;
    } catch (error) {
        throw error;
    }
};


// use then and catch
const processDriverReq = (inputDate, inputTime, inputFrom, inputTo, inputSeats, requestDriverId, vehicleType, fee, callback) => {

    console.log("tripModel.ProcessDriverReq");
    console.log("inputDate = " + inputDate);
    console.log("inputTime = " + inputTime);
    console.log("inputFrom = " + inputFrom);
    console.log("inputTo   = " + inputTo);
    console.log("inputSeats = " + inputSeats);
    console.log("requestDriverId = " + requestDriverId);
    console.log("vehicleType = " + vehicleType);
    console.log("fee = " + fee);

    // driver_id = requestDriverId, req_id = 0
    var insertString = "INSERT INTO trips (driver_id, req_id, departure_location, arrival_location, " +
        "departure_date, departure_time, seats_available, fee, vehicle_type_id, status) " +
        "VALUES(" + requestDriverId + ", 0 , " + inputFrom + ", " + inputTo + ", '" +
        inputDate + "', '" + inputTime + "', " + inputSeats + ", " + fee + ", " + vehicleType +
        " , 'available');";

    console.log(insertString);

    // callback - (error, message)
    db.execute(insertString, [])
        .then((results) => {
            const tripId = results[0].insertId;
            console.log("tripId = " + tripId);
            callback(null, results[0].insertId); // (error=null, tripId)
        })
        .catch((error) => {
            console.log("Error in tripModel.js, " + error);
            callback("Error during trip request - " + eror, null);
        });
};



const getDeleteTrips = async (sortBy) => {
    var deleteTripsQuery = 
    "SELECT tr.id, DATE_FORMAT(departure_date, '%Y-%m-%d') AS d_date, TIME_FORMAT(departure_time, '%h:%i %p') AS d_time, f.city AS from_city, " +
    "t.city AS to_city, seats_available, tr.req_id, tr.driver_id, u.username AS req_name, u1.username AS driver " +
    "FROM trips tr " +
    "JOIN cities f ON f.id = tr.departure_location " +
    "JOIN cities t ON t.id = tr.arrival_location " +
    "LEFT JOIN users u ON tr.req_id = u.id " +
    "LEFT JOIN users u1 ON tr.driver_id = u1.id";

    if (sortBy === 'sortByDate') {
        deleteTripsQuery += " ORDER BY d_date ASC, d_time ASC;";
    } else if (sortBy === 'sortByFromCity') {
        deleteTripsQuery += " ORDER BY from_city ASC, d_date ASC, d_time ASC;";
    } else if (sortBy === 'sortByToCity') {
        deleteTripsQuery += " ORDER BY to_city ASC, d_date ASC, d_time ASC;";
    } else if (sortBy === 'sortByDriver') {
        deleteTripsQuery += " ORDER BY driver ASC, d_date ASC, d_time ASC;";
    } else if (sortBy === 'sortByRequester') {
        deleteTripsQuery += " ORDER BY req_name ASC, d_date ASC, d_time ASC;";
    }

    try {
        const [results] = await db.execute(deleteTripsQuery);
        return results;
    } catch (error) {
        throw error;
    }
};


const deleteTrip = (tripId, callback) => {
    var deleteString = "DELETE FROM trips WHERE id = " + tripId + ";";

    console.log(deleteString);

    db.execute( deleteString , [])
        .then(() => {
            callback(null, 'Delete successful.');
            //callback(true, 'Seats booking successful.');
        })
        .catch((error) => {
            callback('An error occurred during trips deletion.');
        });
};


// get cities
const getCities = async () => {
    try {
        const [results] = await db.execute("select * from cities");
        return results;
    } catch (error) {
        throw error;
    }
};

// get vehicle types
const getVehicleTypes = async () => {
    try {
        const [results] = await db.execute("select * from vehicles");
        return results;
    } catch (error) {
        throw error;
    }
};

// get fees
const getFees = async () => {
    try {
        const [results] = await db.execute("select * from fees");
        return results;
    } catch (error) {
        throw error;
    }
};


// Get number of trips to each city
const getCitiesCount = async (callback) => {
    const mostCommonCitiesQuery = 
        "SELECT city, COUNT(trips.id) AS count " +
        "FROM cities " +
        "LEFT JOIN trips ON cities.id = trips.arrival_location " +
        "GROUP BY city " +
        "ORDER BY count DESC;";

    try {
        results = db.execute(mostCommonCitiesQuery, [])
        return results;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAvailableTrips,
    updateSeatsUsed,
    getConfirmedBookings,
    getRequestedBookings,
    processPassengerReq,

    getTripsAvailableForDriver,
    updateDriverSelectTrip,
    getDriverConfirmedBookings,
    getDriverRequestedBookings,
    processDriverReq,

    getDeleteTrips,
    deleteTrip,

    getCities,
    getVehicleTypes,
    getFees,

    getCitiesCount
};
