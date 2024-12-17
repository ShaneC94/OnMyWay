/**
 * @file userController.js
 * @description This file contains the controller for user registration and login.
 */
const userModel = require('../models/userModel');
//const { parse } = require('json2csv');              // dont know if i need this????????

/********************************** Registration **********************************/
/**
 * Renders the registration page
 */
const registerUser = (req, res) => {  
    res.render('register');
};

/**
 * Processes the registration form submission
 */
const processRegistration = (req, res) => {
    const { username, password } = req.body;

    // Register the user
    userModel.registerUser(username, password, (error, message) => {
        if (error) {
            res.render('register', { error });
        } else {
            res.render('login', { message });
        }
    });
};


/********************************** Login **********************************/
/**
 * Renders the login page
 */
const loginUser = (req, res) => {
    res.render('login');
};

/**
 * 
 */
const processLogin = (req, res) => {
    const { username, password } = req.body;

    userModel.findUser(username, password, (user) => {
        if (user) {
            // Store user information in the session.

            // After user login validation
            console.log("userid = " + user.id);
            req.session.userId = user.id; // Set the user ID in the session
            req.session.username = username; // set username in the session
            req.session.admin = user.admin;
            console.log("processLogin, req.session.admin=" + req.session.admin);
            if (user.admin == 'Y' || user.admin == 'y')
                res.render('adminPage');
            else
                res.redirect('/user/selectRole'); // Redirect to the user's dashboard
        } else {
            res.render('login', { error: 'Invalid username or password.' });
        }
    });
};

module.exports = {
    registerUser,
    processRegistration,
    loginUser,
    processLogin,
};
