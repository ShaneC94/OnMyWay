/**
 * Middleware to check if the user is authenticated.
 * If the user is not authenticated, they are redirected to the login page.
 * Otherwise, the next middleware function is called.
 */
module.exports = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};
