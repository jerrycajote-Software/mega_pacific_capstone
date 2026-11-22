import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  Stack,
  Box,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  CustomVisibilityIcon as VisibilityIcon,
  CustomVisibilityOffIcon as VisibilityOffIcon
} from '../icons';

const AccountDeletionModal = ({
  open,
  submitting,
  errorMessage,
  onCloseModal,
  onSubmitDeletionRequest
}) => {
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setPassword('');
      setShowPassword(false);
      setLocalError('');
    }
  }, [open]);

  // Prevent accidental dismissal when clicking outside the dialog backdrop
  const handleDialogClose = (event, closeReason) => {
    if (closeReason === 'backdropClick' || submitting) return;
    onCloseModal?.();
  };

  const handleConfirmDeletionRequest = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setLocalError('Please enter your current password to confirm your deletion request.');
      return;
    }
    setLocalError('');
    onSubmitDeletionRequest?.({
      password,
      reason: reason.trim()
    });
  };

  const displayedError = localError || errorMessage;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 0.5
        }
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1 }}>
        <Typography variant="h6" fontWeight={900} color="text.primary">
          Request Account Deletion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Enter your current password to send your account deletion request to our Administrator.
        </Typography>
        <IconButton
          aria-label="Close account deletion dialog"
          onClick={() => {
            if (!submitting) onCloseModal?.();
          }}
          disabled={submitting}
          sx={{ position: 'absolute', top: 14, right: 14, color: 'text.secondary' }}
        >
          <i className="fi fi-rr-cross" style={{ fontSize: 14 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleConfirmDeletionRequest} autoComplete="off">
        <DialogContent dividers sx={{ py: 2.5 }}>
          <Stack spacing={2.25}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Once an Administrator approves your request, your account will be deactivated and signed out immediately. Past completed order receipts remain archived for billing records, and you can register a brand-new account with your email anytime later.
            </Alert>

            {displayedError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {displayedError}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Leaving (Optional)"
              placeholder="ex. I finished my roofing project and no longer need this account"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              inputProps={{ maxLength: 500 }}
              helperText={`${reason.length}/500 characters`}
            />

            <TextField
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              label="Current Password"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError('');
              }}
              disabled={submitting}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              disabled={submitting}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1.1
              }}
            >
              {submitting ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} color="inherit" />
                  <span>Sending Request...</span>
                </Stack>
              ) : (
                'Submit Deletion Request'
              )}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountDeletionModal;
