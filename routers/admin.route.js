const express = require("express");
const adminController = require("../controller/admin.controller.js")
const userController = require("../controller/user.controller.js");
const auth = require("../middleware/auth.js")
const upload = require("../middleware/upload.js")
const role = require("../middleware/roleCheck.js")

const router = express.Router()

//Admin routers

router.get("/addCustodian", auth.check_user_auth, role.check_admin_role, adminController.add_custodianView)
router.post("/add-custodian", adminController.add_custodian); 

router.get("/custodian-data/:id", adminController.getCustodianData);

router.post("/update-admin-details", auth.check_user_auth, role.check_admin_role, upload.store_signature, adminController.update_admin)



router.get("/updateCashF", auth.check_user_auth, role.check_admin_role, adminController.updateCashF_view)
router.post('/update-cashfund', auth.check_user_auth, adminController.updateCashFund);


router.get("/admin-ViewTransactions", auth.check_user_auth, role.check_admin_role, (req, res) => {
    res.render("admin/adminViewTransaction")
})

router.get("/logout", auth.check_user_auth, userController.logout)

module.exports = router