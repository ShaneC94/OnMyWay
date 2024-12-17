// userModel.js
const db = require('../db');

const registerUser = (username, password, callback) => {
    db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password])
        .then(() => {
            callback(null, 'Registration successful.');
        })
        .catch((error) => {
            if (error.code === 'ER_DUP_ENTRY') {
                callback('Username is already taken.');
            } else {
                callback('An error occurred during registration.');
            }
        });
};

const findUser = (username, password, callback) => {
    db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
        .then(([results]) => {
            callback(results[0] || null);
        })
        .catch(() => {
            callback(null);
        });
};


const exportDb = async () => {
    try {
        const [results] = await db.execute('Select * from USERS');
        return results;
    } catch (error) {
        throw error;
    }
};

/*
const exportDb = (callback) => {

    console.log("try to export");
    db.execute('SELECT * FROM users')
        .then(([results]) => {
            callback(results || null);
        })
        .catch(() => {
            callback(null);
        });
};
*/

module.exports = {
    registerUser,
    findUser,
    exportDb
};
