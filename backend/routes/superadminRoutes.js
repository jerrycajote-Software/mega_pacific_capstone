const express = require("express");
const router = express.Router();
const systemController = require("../controllers/superadmin/systemController");
const { verifySuperAdmin } = require("../middleware/authMiddleware");

// Ensure only superadmin can access these routes
router.use(verifySuperAdmin);

router.get("/status", systemController.getSuperadminStatus);
router.put("/status", systemController.updateSuperadminStatus);

router.get("/active-users", systemController.getActiveUsers);
router.get("/session-logs", systemController.getSessionLogs);

module.exports = router;
