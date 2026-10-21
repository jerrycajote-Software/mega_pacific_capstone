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
  updateVariant,
  deleteVariant,
} = require("../../controllers/admin/variantController");
const { verifyStaff, verifyAdmin } = require("../../middleware/authMiddleware");

router.get("/", verifyStaff, getProducts);
router.post("/", verifyAdmin, createProduct);
router.put("/:id", verifyAdmin, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);

router.post("/stock-adjust", verifyStaff, adjustStock);
router.post("/stock-adjust-bulk", verifyStaff, bulkAdjustStock);
router.get("/stock-logs", verifyStaff, getStockLogs);

router.get("/:productId/variants", verifyStaff, getVariants);
router.post("/:productId/variants", verifyAdmin, createVariant);
router.put("/:productId/variants/:id", verifyAdmin, updateVariant);
router.delete("/:productId/variants/:id", verifyAdmin, deleteVariant);

module.exports = router;
