const req = require("express/lib/request");
const jwt = require("jsonwebtoken")


// Check if the user is authenticated
const check_user_auth = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, "secretKey", (err, decode) => {
            if (err) {
                res.redirect("login");
            } else {
                console.log('Decoded Token:', decode); // Make sure this contains `id`, `username`, and `userType`
                req.user = { user_id: decode.id, username: decode.username, userType: decode.userType };
                console.log('User in req:', req.user); // Debugging line to check if req.user is correctly set
                next();
            }
        });
    } else {
        res.redirect("login");
    }
};


// Check if user is NOT authenticated (used for login and register pages)
const check_user_not_auth = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        return res.redirect("/dashboardAdmin"); // Redirect authenticated users to the admin dashboard
    } else {
        return next(); // Continue if user is not authenticated
    }
};

module.exports = {
    check_user_auth,
    check_user_not_auth,

}