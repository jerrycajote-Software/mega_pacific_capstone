const express = require("express");
const router = express.Router();
const { submitUserErrorReport } = require("../controllers/monitoringController");

// Allow end users from Customer, Sales, Finance, Logistic, Owner, or login pages to send error reports to Admin
router.post("/", submitUserErrorReport);

module.exports = router;
