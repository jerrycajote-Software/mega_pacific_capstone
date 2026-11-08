const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { handleUploadImage, handleUploadBatchImages } = require("../controllers/uploadController");

router.post("/image", verifyToken, handleUploadImage);
router.post("/batch", verifyToken, handleUploadBatchImages);

module.exports = router;

