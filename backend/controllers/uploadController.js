const storageService = require("../services/storageService");

const handleUploadImage = async (req, res) => {
  try {
    const { image, folder = "products" } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image payload provided for upload.",
      });
    }

    const publicUrl = await storageService.uploadBase64Image(image, folder);
    const { isConfigured } = storageService.getStorageConfig();

    return res.status(200).json({
      success: true,
      url: publicUrl,
      isCdn: isConfigured && /^https?:\/\//i.test(publicUrl),
      message: "Image processed successfully.",
    });
  } catch (error) {
    console.error("Upload controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process image upload.",
    });
  }
};

const handleUploadBatchImages = async (req, res) => {
  try {
    const { images = [], folder = "products" } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of images to upload.",
      });
    }

    const uploadedUrls = await Promise.all(
      images.map((img) => storageService.uploadBase64Image(img, folder))
    );

    return res.status(200).json({
      success: true,
      urls: uploadedUrls,
      message: "Batch images processed successfully.",
    });
  } catch (error) {
    console.error("Batch upload controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process batch image upload.",
    });
  }
};

module.exports = {
  handleUploadImage,
  handleUploadBatchImages,
};

