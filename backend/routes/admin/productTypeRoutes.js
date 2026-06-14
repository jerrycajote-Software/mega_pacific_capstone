const express = require("express");
const router = express.Router();
const {
  getProductTypes,
  createProductType,
} = require("../../controllers/admin/productTypeController");


router.get("/", getProductTypes);
router.post("/", createProductType);

module.exports = router;
