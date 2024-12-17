/**
 * @api {module} routes/sessionConfig Session Config
 * 
 * Manages the session configuration that stores session data in a MySQL database.
 */

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Export a function that takes a db object and returns a session configuration middleware
module.exports = (db) => {
    const sessionStore = new MySQLStore({}, db);

    // Show sessionStore is ready
    sessionStore.onReady()
        .then(() => console.log('MySQLStore ready'))
        .catch(error => console.error(error));

    // Middleware for session configuration and storage
    return session({
        key: 'session_cookie_name',         // Name of the session cookie
        secret: 'session_cookie_secret',    // Secret used to sign the session ID cookie
        store: sessionStore,                // Session store instance (MySQL store)
        resave: false,                      // Prevents session from being saved back to the store if it wasn't modified
        saveUninitialized: false            // Prevents uninitialized sessions from being saved to the store
    });
};
