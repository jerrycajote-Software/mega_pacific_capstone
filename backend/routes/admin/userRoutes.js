const express = require("express");
const router = express.Router();
const { getUsers, updateUserStatus } = require("../../controllers/admin/userController");

router.get("/", getUsers);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
