const express = require("express");
const custodianController = require("../controller/custodian.controller.js");
const userController = require("../controller/user.controller.js");
const auth = require("../middleware/auth.js")
const role = require("../middleware/roleCheck.js")
const { Custodian } = require('../models'); // Adjust the path to your models
const { Transactions } = require('../models');
const storeR = require("../middleware/storeR.js")

const router = express.Router();

router.get("/addTrans", auth.check_user_auth, role.check_custodian_role, custodianController.addTrans);
router.post('/addTransaction', auth.check_user_auth,  custodianController.addTransaction);

// Route to render Update Transaction page
router.get('/updateTrans', custodianController.getUpdateTransaction);

// Route to handle the Update Transaction form submission
router.post('/updateTransaction', storeR.store_resibo, custodianController.postUpdateTransaction);

router.get('/report', auth.check_user_auth, custodianController.generateReport);


router.get("/printVoucher/:id", auth.check_user_auth, custodianController.getTransactionForVoucher);
router.get("/logout", auth.check_user_auth, userController.logout)

module.exports = router;