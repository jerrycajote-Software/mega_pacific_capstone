import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Avatar,
  CircularProgress
} from '@mui/material';

export const compressProfilePhoto = (file, targetSize = 360, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file must be an image (PNG, JPG, WebP).'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File size exceeds 10MB limit. Please choose a smaller photo.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image format.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // Fallback to raw data url if canvas crop fails
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const ProfilePhotoPreviewModal = ({
  open,
  previewUrl,
  onClose,
  onConfirmSave,
  saving = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1 }}>
        Update Profile Photo
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={previewUrl || undefined}
            sx={{
              width: 140,
              height: 140,
              boxShadow: '0 8px 28px rgba(79, 119, 45, 0.25)',
              border: '4px solid #ffffff'
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 1.5 }}>
          Preview of your new profile photo. It will be displayed on your profile card, navigation header, and support desk.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between', gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            flex: 1
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={onConfirmSave}
          disabled={saving}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            flex: 1.2
          }}
          startIcon={saving ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : null}
        >
          {saving ? 'Saving...' : 'Save Profile Photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const RemovePhotoConfirmDialog = ({
  open,
  onClose,
  onConfirmRemove,
  removing = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={removing ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
        Remove Profile Photo?
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to remove your custom profile photo? Your account will revert to the default profile picture across all screens.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={removing}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Keep Photo
        </Button>

        <Button
          onClick={onConfirmRemove}
          disabled={removing}
          variant="contained"
          color="error"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          startIcon={removing ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : null}
        >
          {removing ? 'Removing...' : 'Remove Photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
