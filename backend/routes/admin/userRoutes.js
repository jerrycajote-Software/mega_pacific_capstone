const express = require("express");
const router = express.Router();
const { getUsers } = require("../../controllers/admin/userController");

router.get("/", getUsers);

module.exports = router;
