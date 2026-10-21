const express = require("express");
const router = express.Router();
const { getProductById, getProducts, getCoilAvailability } = require("../../controllers/customer/productController");

router.get("/coil-availability", getCoilAvailability);
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
