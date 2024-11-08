const express = require("express");
const custodianController = require("../controller/custodian.controller.js");

const router = express.Router();

router.get("/addTrans", custodianController.addTrans);
router.get("/custoViewTrans", custodianController.CustoViewTrans);
router.get("/printVouch", custodianController.PrintVouch);

module.exports = router;