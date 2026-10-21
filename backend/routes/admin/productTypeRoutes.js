const express = require("express");
const router = express.Router();
const {
  getProductTypes,
  createProductType,
} = require("../../controllers/admin/productTypeController");
const { verifyStaff, verifyAdmin } = require("../../middleware/authMiddleware");

router.get("/", verifyStaff, getProductTypes);
router.post("/", verifyAdmin, createProductType);

module.exports = router;
