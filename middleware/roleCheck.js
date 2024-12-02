const req = require("express/lib/request");
const jwt = require("jsonwebtoken")

// Check if user is an Admin
const check_admin_role = (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        return next(); // Proceed if user is an admin
    } else {
        return res.status(403).json({ message: "Access denied: Admins only." }); // Send error if user is not admin
    }
};

// Check if user is a Custodian
const check_custodian_role = (req, res, next) => {
    if (req.user && req.user.userType === 'custodian') {
        return next(); // Proceed if user is a custodian
    } else {
        return res.status(403).json({ message: "Access denied: Custodians only." }); // Send error if user is not custodian
    }
};

module.exports = {
    check_admin_role,
    check_custodian_role,
};