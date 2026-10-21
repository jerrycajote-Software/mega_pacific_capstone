const express = require("express");
const router = express.Router();
const { getUsers, updateUserStatus } = require("../../controllers/admin/userController");
const { verifyAdmin } = require("../../middleware/authMiddleware");

router.get("/", verifyAdmin, getUsers);
router.patch("/:id/status", verifyAdmin, updateUserStatus);

module.exports = router;
