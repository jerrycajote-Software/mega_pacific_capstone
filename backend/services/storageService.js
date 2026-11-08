const crypto = require("crypto");

const getStorageConfig = () => {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "megaroof-media";
  const cleanUrl = url.replace(/\/+$/, "");

  return {
    isConfigured: Boolean(cleanUrl && key),
    cleanUrl,
    key,
    bucket,
  };
};

const mimeToExtension = (mime) => {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return map[mime?.toLowerCase()] || "jpg";
};

const uploadBase64Image = async (dataUriOrBase64, folder = "products") => {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== "string") {
    throw new Error("Invalid image payload: string expected.");
  }

  // Already a remote CDN or external URL
  if (/^https?:\/\//i.test(dataUriOrBase64.trim())) {
    return dataUriOrBase64.trim();
  }

  let mimeType = "image/jpeg";
  let base64Data = dataUriOrBase64;

  const matches = dataUriOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
  if (matches) {
    mimeType = matches[1];
    base64Data = matches[2];
  }

  const { isConfigured, cleanUrl, key, bucket } = getStorageConfig();

  // Graceful fallback: return compressed data URI if Supabase Storage is not yet configured in .env
  if (!isConfigured) {
    return dataUriOrBase64;
  }

  const buffer = Buffer.from(base64Data, "base64");
  const ext = mimeToExtension(mimeType);
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const fileName = `${Date.now()}_${randomSuffix}.${ext}`;
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const filePath = `${sanitizedFolder}/${fileName}`;

  const uploadEndpoint = `${cleanUrl}/storage/v1/object/${bucket}/${filePath}`;

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": mimeType,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Supabase Storage upload failed:", response.status, errorText);
    // Return original data URL as safety fallback so users are never blocked
    return dataUriOrBase64;
  }

  return `${cleanUrl}/storage/v1/object/public/${bucket}/${filePath}`;
};

module.exports = {
  uploadBase64Image,
  getStorageConfig,
};

