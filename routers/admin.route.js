const express = require("express");
const adminController = require("../controller/admin.controller.js")

const router = express.Router()

//Admin routers

router.get("/addCustodian", adminController.add_custodianView)
router.post("/add-custodian", adminController.add_custodian); // Add POST route

router.get("/custodian-data/:id", adminController.getCustodianData);


router.get("/updateCashF", adminController.updateCashF_view)
router.post('/update-cashfund', adminController.updateCashFund);


router.get("/admin-ViewTransactions", (req, res) => {
    res.render("admin/adminViewTransaction")
})

module.exports = router