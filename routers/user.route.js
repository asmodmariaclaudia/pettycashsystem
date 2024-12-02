const express = require("express");
const userController = require("../controller/user.controller.js");
const auth = require("../middleware/auth.js")
const role = require("../middleware/roleCheck.js")


const router = express.Router();

// User routers and GET
router.get("/login", auth.check_user_not_auth, userController.login_view);
router.get("/dashboardAdmin", auth.check_user_auth, role.check_admin_role, userController.dashboardAdmin_view);
router.get("/dashboardCustodian", auth.check_user_auth, role.check_custodian_role, userController.custoDash);

router.get('/updateCustodianStatus/:user_id', auth.check_user_auth, role.check_admin_role, userController.updateCustodianStatus);

// POST
router.post("/register-user", auth.check_user_not_auth, userController.save_user);
router.post("/login-user", auth.check_user_not_auth, userController.login_user);

module.exports = router;
