/**
 * Chat Image Helper
 * Handles parsing structured message payloads and compressing image attachments for Customer Support & Sales Desk.
 */

export const parseMessageContent = (content) => {
  if (!content) return { text: '', image: null };

  if (typeof content === 'string') {
    let trimmed = content.trim();

    // Strip Byte Order Mark (BOM) or zero-width unicode spaces
    trimmed = trimmed.replace(/^[\uFEFF\u200B]+/, '');

    // Handle double-stringified JSON payloads
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 2) {
      try {
        const unescaped = JSON.parse(trimmed);
        if (typeof unescaped === 'string') {
          trimmed = unescaped.trim();
        }
      } catch (err) {
        // Continue with original trimmed string
      }
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          const image = parsed.image || parsed.imageUrl || parsed.img || parsed.file || parsed.attachment || parsed.photo || null;
          const text = typeof parsed.text === 'string'
            ? parsed.text
            : (typeof parsed.content === 'string' ? parsed.content : (typeof parsed.message === 'string' ? parsed.message : ''));
          return { text, image };
        }
      } catch (err) {
        // Fall through to regex-based extraction
      }
    }

    // Direct data URL or image URL check
    if (trimmed.startsWith('data:image/') || /^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|svg)/i.test(trimmed)) {
      return { text: '', image: trimmed };
    }

    // Regex fallback if JSON had unescaped characters, linebreaks, or trailing characters
    const imageMatch = trimmed.match(/"(?:image|imageUrl|img|attachment|photo)"\s*:\s*"((?:data:image\/[^"]+)|(?:https?:\/\/[^"]+))"/i);
    if (imageMatch) {
      const textMatch = trimmed.match(/"(?:text|content|message)"\s*:\s*"([^"]*)"/i);
      return {
        text: textMatch ? textMatch[1] : '',
        image: imageMatch[1]
      };
    }

    return { text: content, image: null };
  }

  if (typeof content === 'object' && content !== null) {
    return {
      text: content.text || content.content || content.message || '',
      image: content.image || content.imageUrl || content.img || content.attachment || content.photo || null
    };
  }

  return { text: String(content), image: null };
};

export const formatMessagePreview = (content, maxLength = 60) => {
  if (!content) return '';
  const { text, image } = parseMessageContent(content);
  if (text && image) {
    const truncated = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    return `📷 ${truncated}`;
  }
  if (image) {
    return '📷 Photo Attachment';
  }
  if (text) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }
  return '';
};

export const compressChatImage = (file, maxDimension = 1280, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for upload.'));
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid file type: Please choose an image file (PNG, JPG, or WEBP).'));
    }

    const MAX_RAW_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_RAW_BYTES) {
      return reject(new Error('File size exceeds 10MB limit. Please choose a smaller image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the selected image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve(e.target.result);
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
