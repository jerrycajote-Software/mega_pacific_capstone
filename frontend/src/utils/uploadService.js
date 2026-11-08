import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const uploadImageToStorage = async (imagePayload, folder = 'products') => {
  if (!imagePayload) return '';

  // Already a CDN or remote URL
  if (/^https?:\/\//i.test(imagePayload.trim())) {
    return imagePayload.trim();
  }

  try {
    const token = localStorage.getItem('appToken');
    const res = await axios.post(
      `${API_URL}/api/upload/image`,
      { image: imagePayload, folder },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (res.data?.success && res.data.url) {
      return res.data.url;
    }
    return imagePayload;
  } catch (error) {
    console.error('Failed to upload image to CDN storage:', error?.response?.data || error.message);
    // Graceful fallback to original payload so flow is never blocked
    return imagePayload;
  }
};

export const uploadBatchImagesToStorage = async (imagesArray = [], folder = 'products') => {
  if (!Array.isArray(imagesArray) || imagesArray.length === 0) return [];

  // Filter out those that are already remote URLs to avoid redundant calls
  const pendingIndices = [];
  const pendingImages = [];

  imagesArray.forEach((img, idx) => {
    if (img && !/^https?:\/\//i.test(img.trim())) {
      pendingIndices.push(idx);
      pendingImages.push(img);
    }
  });

  if (pendingImages.length === 0) {
    return imagesArray;
  }

  try {
    const token = localStorage.getItem('appToken');
    const res = await axios.post(
      `${API_URL}/api/upload/batch`,
      { images: pendingImages, folder },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (res.data?.success && Array.isArray(res.data.urls)) {
      const result = [...imagesArray];
      pendingIndices.forEach((origIdx, batchIdx) => {
        result[origIdx] = res.data.urls[batchIdx] || result[origIdx];
      });
      return result;
    }
    return imagesArray;
  } catch (error) {
    console.error('Failed to batch upload images to CDN storage:', error?.response?.data || error.message);
    return imagesArray;
  }
};

export const uploadVideoToStorage = async (videoPayload, folder = 'products/videos') => {
  if (!videoPayload) return '';

  // Already a remote CDN or external URL (ex. YouTube, Vimeo, Supabase URL)
  if (/^https?:\/\//i.test(videoPayload.trim())) {
    return videoPayload.trim();
  }

  try {
    const token = localStorage.getItem('appToken');
    const res = await axios.post(
      `${API_URL}/api/upload/video`,
      { video: videoPayload, folder },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    if (res.data?.success && res.data.url) {
      return res.data.url;
    }
    return videoPayload;
  } catch (error) {
    const errData = error?.response?.data;
    console.error('Failed to upload video to CDN storage:', errData || error.message);
    
    if (error?.response?.status === 507 || errData?.code === 'STORAGE_INSUFFICIENT' || /insufficient|quota|out of space/i.test(errData?.message || errData?.error || '')) {
      throw new Error(errData?.message || errData?.error || 'Storage is insufficient in production hosting. Please free up storage space in your Supabase project or contact support.');
    }
    if (error?.response?.status === 413 || /too large|exceeds/i.test(errData?.message || errData?.error || '')) {
      throw new Error(errData?.message || errData?.error || 'Video file size exceeds the 25 MB limit. Please select a shorter or compressed video.');
    }
    // Graceful fallback to original payload so the product save flow is not blocked
    return videoPayload;
  }
};

