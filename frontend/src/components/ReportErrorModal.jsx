import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { CustomCloseIcon } from './icons';
import { submitErrorReportToAdmin } from '../utils/errorMonitor';

const PORTAL_LABELS = {
  customer: 'Customer Portal',
  sales: 'Sales Portal',
  finance: 'Finance Portal',
  logistic: 'Logistics Portal',
  owner: 'Owner Portal',
  admin: 'Admin Portal',
  guest: 'Login / Public Page'
};

// Allow any end user to send a captured error trace with an optional note directly to Admin
const ReportErrorModal = ({ open, onClose, errorRecord, onSubmitted }) => {
  const [userDescription, setUserDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);

  useEffect(() => {
    if (open) {
      setUserDescription('');
      setSubmitError('');
      setSubmittedReport(null);
    }
  }, [open, errorRecord?.traceId]);

  const handleModalCloseRequest = (_event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    if (onClose) onClose();
  };

  const handleSendErrorReportToAdmin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const result = await submitErrorReportToAdmin({
        errorRecord,
        userDescription
      });
      setSubmittedReport(result.data || { traceId: errorRecord?.traceId });
      if (onSubmitted) {
        onSubmitted(result.data);
      }
    } catch (err) {
      setSubmitError(err?.message || 'Unable to send your error report right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const portalLabel = PORTAL_LABELS[errorRecord?.portal] || 'Portal';

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleModalCloseRequest}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.25,
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            Report Error to Admin
          </Typography>
          <Typography variant="caption" color="#64748b">
            Our technical details are attached automatically so Admin can investigate quickly.
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close error report dialog"
          size="small"
          sx={{ color: '#475569', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
        >
          <CustomCloseIcon size={16} color="#475569" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {submittedReport ? (
          <Alert severity="success" sx={{ borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom>
              Error Report Sent to Admin
            </Typography>
            <Typography variant="body2">
              Thank you for letting us know. Admin has been notified with Reference Code{' '}
              <strong>{submittedReport.traceId || errorRecord?.traceId}</strong>.
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Chip
                  label={`Reference: ${errorRecord?.traceId || 'Auto-generated'}`}
                  size="small"
                  sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontFamily: 'monospace' }}
                />
                <Chip
                  label={portalLabel}
                  size="small"
                  sx={{ bgcolor: '#e0e7ff', color: '#1e3a8a', fontWeight: 700 }}
                />
              </Box>
              <Typography variant="caption" color="#475569" sx={{ display: 'block' }}>
                Page: <strong>{errorRecord?.pageUrl || window.location.pathname}</strong>
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="What were you doing when this error happened? (Optional)"
              placeholder="ex. I clicked Pay 50% on the checkout page and the screen showed an error."
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              disabled={submitting}
              helperText="Your page location and error reference code will be sent automatically."
            />

            {submitError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {!submittedReport && (
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSendErrorReportToAdmin}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              py: 1.25,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none'
            }}
          >
            {submitting ? 'Sending Error Report...' : 'Send Error Report to Admin'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportErrorModal;
