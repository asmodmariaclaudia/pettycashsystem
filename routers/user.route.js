const express = require("express");
const userController = require("../controller/user.controller.js");

const router = express.Router();

// User routers and GET
router.get("/login", userController.login_view);
router.get("/dashboardAdmin", userController.dashboardAdmin_view); // Ensure this matches the route used in the redirect

// POST
router.post("/register-user", userController.save_user);
router.post("/login-user", userController.login_user);

module.exports = router;
