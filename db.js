/**
 * This file is used to create a connection pool to the MySQL database.
 */
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'carpooldb',
    connectionLimit: 10, // Adjust this value as needed
});

module.exports = pool.promise();
