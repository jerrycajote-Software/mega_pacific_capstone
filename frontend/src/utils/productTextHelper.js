// Helper utilities for safely formatting product descriptions and media arrays

export const extractPlainProductText = (htmlString, fallbackText = '') => {
  if (!htmlString || typeof htmlString !== 'string') return fallbackText;

  const stripped = htmlString
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ');

  if (typeof document !== 'undefined') {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = stripped;
    const decoded = decoder.value.replace(/\s+/g, ' ').trim();
    return decoded || fallbackText;
  }

  return stripped
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim() || fallbackText;
};

export const sanitizeProductHtml = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') return '';

  return htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/&nbsp;/gi, ' ');
};

export const getProductImageList = (product) => {
  if (!product) return [];

  let urls = [];
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    urls = [...product.imageUrls];
  } else if (typeof product.imageUrls === 'string' && product.imageUrls.trim()) {
    try {
      const parsed = JSON.parse(product.imageUrls);
      urls = Array.isArray(parsed) ? parsed : [product.imageUrls];
    } catch {
      urls = [product.imageUrls];
    }
  }

  if (product.imageUrl && !urls.includes(product.imageUrl)) {
    urls = [product.imageUrl, ...urls];
  }

  return urls.filter((url) => typeof url === 'string' && url.trim().length > 0);
};
