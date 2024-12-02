const express = require("express");
const custodianController = require("../controller/custodian.controller.js");
const userController = require("../controller/user.controller.js");
const auth = require("../middleware/auth.js")
const role = require("../middleware/roleCheck.js")
const { Custodian } = require('../models'); // Adjust the path to your models

const router = express.Router();

router.get("/addTrans", auth.check_user_auth, role.check_custodian_role, custodianController.addTrans);
router.post('/addTransaction', auth.check_user_auth,  custodianController.addTransaction);



router.post('/updateTransaction', auth.check_user_auth, custodianController.updateTransaction);

router.get("/printVouch", auth.check_user_auth, custodianController.PrintVouch);
router.get("/logout", auth.check_user_auth, userController.logout)

module.exports = router;