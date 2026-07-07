const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/admin/productController");
const {
  getVariants,
  createVariant,
  deleteVariant,
} = require("../../controllers/admin/variantController");


router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);


router.get("/:productId/variants", getVariants);
router.post("/:productId/variants", createVariant);
router.delete("/:productId/variants/:id", deleteVariant);

module.exports = router;
