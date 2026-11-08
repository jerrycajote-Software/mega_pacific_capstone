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
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-matroska": "mkv",
    "video/ogg": "ogv"
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

  if (dataUriOrBase64.startsWith("data:")) {
    const commaIdx = dataUriOrBase64.indexOf(",");
    if (commaIdx !== -1) {
      const header = dataUriOrBase64.slice(0, commaIdx);
      const mimeMatch = header.match(/^data:([^;]+)/);
      if (mimeMatch) mimeType = mimeMatch[1];
      base64Data = dataUriOrBase64.slice(commaIdx + 1);
    }
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

const uploadBase64Video = async (dataUriOrBase64, folder = "products/videos") => {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== "string") {
    throw new Error("Invalid video payload: string expected.");
  }

  // Already a remote CDN or external URL (ex. YouTube, Vimeo, Supabase URL)
  if (/^https?:\/\//i.test(dataUriOrBase64.trim())) {
    return dataUriOrBase64.trim();
  }

  let mimeType = "video/mp4";
  let base64Data = dataUriOrBase64;

  if (dataUriOrBase64.startsWith("data:")) {
    const commaIdx = dataUriOrBase64.indexOf(",");
    if (commaIdx !== -1) {
      const header = dataUriOrBase64.slice(0, commaIdx);
      const mimeMatch = header.match(/^data:([^;]+)/);
      if (mimeMatch) mimeType = mimeMatch[1];
      base64Data = dataUriOrBase64.slice(commaIdx + 1);
    }
  }

  const buffer = Buffer.from(base64Data, "base64");
  const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB max limit

  if (buffer.length > MAX_VIDEO_BYTES) {
    const error = new Error(`Video file size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit. Please compress or trim the video.`);
    error.statusCode = 413;
    throw error;
  }

  const { isConfigured, cleanUrl, key, bucket } = getStorageConfig();

  // If Supabase Storage is not configured
  if (!isConfigured) {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Storage is insufficient or not configured in production hosting. Please configure storage credentials.");
      error.statusCode = 507;
      error.code = "STORAGE_INSUFFICIENT";
      throw error;
    }
    // Development fallback to allow local testing
    return dataUriOrBase64;
  }

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
    console.error("Supabase Storage video upload failed:", response.status, errorText);

    // Detect insufficient storage or quota exceeded
    const isInsufficientStorage = 
      response.status === 507 || 
      response.status === 413 ||
      /quota|insufficient|limit|exceeded|out of space|storage_limit/i.test(errorText);

    if (isInsufficientStorage) {
      const error = new Error("Storage is insufficient in production hosting. Please free up storage space in your Supabase project or contact support.");
      error.statusCode = 507;
      error.code = "STORAGE_INSUFFICIENT";
      throw error;
    }

    const error = new Error(`Failed to upload product video to storage: ${errorText || response.statusText}`);
    error.statusCode = response.status;
    throw error;
  }

  return `${cleanUrl}/storage/v1/object/public/${bucket}/${filePath}`;
};

module.exports = {
  uploadBase64Image,
  uploadBase64Video,
  getStorageConfig,
};

