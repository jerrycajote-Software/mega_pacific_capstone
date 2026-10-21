const express = require("express");
const router = express.Router();
const { verifySales } = require("../../middleware/authMiddleware");
const {
  getPreOrderProducts,
  createPreOrderProduct,
  updatePreOrderProduct,
  deletePreOrderProduct,
  addVariant,
  deleteVariant,
  togglePreOrderProductStatus
} = require("../../controllers/sales/preOrderProductController");

router.get("/", verifySales, getPreOrderProducts);
router.post("/", verifySales, createPreOrderProduct);
router.put("/:id", verifySales, updatePreOrderProduct);
router.patch("/:id/status", verifySales, togglePreOrderProductStatus);
router.delete("/:id", verifySales, deletePreOrderProduct);
router.post("/:id/variants", verifySales, addVariant);
router.delete("/:id/variants/:variantId", verifySales, deleteVariant);

module.exports = router;
