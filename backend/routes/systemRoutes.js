const express = require("express");
const router = express.Router();
const systemController = require("../controllers/superadmin/systemController");

// Public route to check if portals are online/offline
router.get("/status", systemController.getSystemStatus);

module.exports = router;
