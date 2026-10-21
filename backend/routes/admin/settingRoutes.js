const express = require("express");
const { getSettings, updateSetting } = require("../../controllers/admin/settingController");
const { verifyAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyAdmin, getSettings);
router.put("/:key", verifyAdmin, updateSetting);

module.exports = router;
