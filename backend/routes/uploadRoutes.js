const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { handleUploadImage, handleUploadBatchImages, handleUploadVideo } = require("../controllers/uploadController");

router.post("/image", verifyToken, handleUploadImage);
router.post("/batch", verifyToken, handleUploadBatchImages);
router.post("/video", verifyToken, handleUploadVideo);

module.exports = router;

