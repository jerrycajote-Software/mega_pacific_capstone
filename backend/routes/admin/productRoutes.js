const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  deleteProduct,
} = require("../../controllers/admin/productController");
const {
  getVariants,
  createVariant,
  deleteVariant,
} = require("../../controllers/admin/variantController");


router.get("/", getProducts);
router.post("/", createProduct);
router.delete("/:id", deleteProduct);


router.get("/:productId/variants", getVariants);
router.post("/:productId/variants", createVariant);
router.delete("/:productId/variants/:id", deleteVariant);

module.exports = router;
