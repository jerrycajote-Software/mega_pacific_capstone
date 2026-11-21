const express = require("express");
const router = express.Router();
const { logClientMonitoringError } = require("../controllers/monitoringController");

// Endpoint for automatic frontend runtime, crash, and API error trace forwarding
router.post("/client-error", logClientMonitoringError);

module.exports = router;
