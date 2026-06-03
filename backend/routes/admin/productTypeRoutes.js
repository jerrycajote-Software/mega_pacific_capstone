const express = require("express");
const router = express.Router();
const {
  getProductTypes,
  createProductType,
} = require("../../controllers/admin/productTypeController");

// Product Type CRUD
router.get("/", getProductTypes);
router.post("/", createProductType);

module.exports = router;
