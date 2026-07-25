const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  bulkAdjustStock,
  getStockLogs,
} = require("../../controllers/admin/productController");
const {
  getVariants,
  createVariant,
  deleteVariant,
} = require("../../controllers/admin/variantController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Stock Management & Audit Logging Routes
router.post("/stock-adjust", verifyToken, adjustStock);
router.post("/stock-adjust-bulk", verifyToken, bulkAdjustStock);
router.get("/stock-logs", verifyToken, getStockLogs);

router.get("/:productId/variants", getVariants);
router.post("/:productId/variants", createVariant);
router.delete("/:productId/variants/:id", deleteVariant);

module.exports = router;
