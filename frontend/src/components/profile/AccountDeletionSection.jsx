import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import AccountDeletionModal from './AccountDeletionModal';
import {
  fetchCustomerDeletionStatus,
  submitCustomerDeletionRequest,
  cancelCustomerDeletionRequest
} from '../../services/accountDeletionApi';

const formatCurrencyPhp = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const AccountDeletionSection = ({ token, onShowFeedback }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusData, setStatusData] = useState(null);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);

  const loadAccountDeletionStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetchCustomerDeletionStatus(token);
      if (response?.success) {
        setStatusData(response.data);
      } else {
        setLoadError(response?.message || 'Unable to check your account deletion status.');
      }
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Unable to load account deletion information right now.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAccountDeletionStatus();
  }, [loadAccountDeletionStatus]);

  const handleOpenDeletionRequestModal = () => {
    setSubmitError('');
    setRequestModalOpen(true);
  };

  const handleCloseDeletionRequestModal = () => {
    setRequestModalOpen(false);
    setSubmitError('');
  };

  const handleSubmitDeletionRequest = async ({ password, reason }) => {
    setSubmittingRequest(true);
    setSubmitError('');
    try {
      const response = await submitCustomerDeletionRequest({ password, reason }, token);
      if (response?.success) {
        setRequestModalOpen(false);
        await loadAccountDeletionStatus();
        onShowFeedback?.(
          response.message || 'Your account deletion request has been sent to the Administrator.',
          'success'
        );
      } else {
        setSubmitError(response?.message || 'Failed to submit your account deletion request.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit your account deletion request.');
      if (err.response?.status === 409) {
        loadAccountDeletionStatus();
      }
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleConfirmCancelDeletionRequest = async () => {
    setCancellingRequest(true);
    try {
      const response = await cancelCustomerDeletionRequest(token);
      if (response?.success) {
        setCancelDialogOpen(false);
        await loadAccountDeletionStatus();
        onShowFeedback?.(
          response.message || 'Your account deletion request has been cancelled.',
          'success'
        );
      }
    } catch (err) {
      onShowFeedback?.(
        err.response?.data?.message || 'Unable to cancel your account deletion request right now.',
        'error'
      );
    } finally {
      setCancellingRequest(false);
    }
  };

  const eligibility = statusData?.eligibility || {
    eligible: false,
    ongoingOrders: [],
    pendingRefunds: [],
    blockerMessage: ''
  };
  const activeRequest = statusData?.activeRequest || null;
  const latestRequest = statusData?.latestRequest || null;
  const ongoingOrders = eligibility.ongoingOrders ?? [];
  const pendingRefunds = eligibility.pendingRefunds ?? [];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mt: 3.5,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: activeRequest ? 'warning.main' : 'rgba(239, 68, 68, 0.28)',
          bgcolor: 'background.paper',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 2.5,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={900} color="text.primary">
              Account Deletion
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Request permanent deactivation of your customer account. An Administrator will review your request before deleting your account.
            </Typography>
          </Box>

          {!loading && !loadError && (
            <Chip
              label={
                activeRequest
                  ? 'Waiting for Admin Review'
                  : eligibility.eligible
                    ? 'Eligible to Request'
                    : 'Action Required First'
              }
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: activeRequest
                  ? 'rgba(245, 158, 11, 0.14)'
                  : eligibility.eligible
                    ? 'rgba(22, 163, 74, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                color: activeRequest ? '#b45309' : eligibility.eligible ? '#15803d' : '#b91c1c'
              }}
            />
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Checking your active orders and refunds...
            </Typography>
          </Box>
        ) : loadError ? (
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadAccountDeletionStatus} sx={{ fontWeight: 700, textTransform: 'none' }}>
                Try Again
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : activeRequest ? (
          <Stack spacing={2}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Your account deletion request was submitted on <strong>{formatDisplayDate(activeRequest.createdAt)}</strong> and is currently waiting for Administrator approval.
            </Alert>

            {activeRequest.reason && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                  Submitted Reason
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ mt: 0.4 }}>
                  {activeRequest.reason}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setCancelDialogOpen(true)}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 2.5 }}
              >
                Cancel Deletion Request
              </Button>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2.25}>
            {latestRequest?.status === 'rejected' && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Your previous account deletion request ({formatDisplayDate(latestRequest.reviewedAt)}) was not approved.
                {latestRequest.adminNotes ? ` Administrator note: "${latestRequest.adminNotes}"` : ''}
              </Alert>
            )}

            {!eligibility.eligible ? (
              <Box>
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                  {eligibility.blockerMessage || 'You cannot request account deletion while you have ongoing orders or incomplete refunds.'}
                </Alert>

                {ongoingOrders.length > 0 && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                      Ongoing Orders ({ongoingOrders.length})
                    </Typography>
                    <Stack divider={<Divider flexItem />} spacing={1}>
                      {ongoingOrders.map((ord) => (
                        <Box key={ord.orderId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" fontWeight={700} color="text.primary">
                            {ord.orderNumber} ({formatCurrencyPhp(ord.total)})
                          </Typography>
                          <Chip label={ord.statusLabel} size="small" color="warning" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {pendingRefunds.length > 0 && (
                  <Box sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
                      Ongoing Refunds Not Yet Returned ({pendingRefunds.length})
                    </Typography>
                    <Stack divider={<Divider flexItem />} spacing={1}>
                      {pendingRefunds.map((ref) => (
                        <Box key={`${ref.orderId}-${ref.refundId || 'pending'}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" fontWeight={700} color="text.primary">
                            {ref.refundNumber ? `${ref.refundNumber} — ` : ''}Order {ref.orderNumber} ({formatCurrencyPhp(ref.amount)})
                          </Typography>
                          <Chip label={ref.statusLabel} size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                You currently have no ongoing orders and no pending refunds. If you request deletion and an Administrator approves it, your account will be deactivated while past completed order receipts remain archived for billing records.
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="error"
                disabled={!eligibility.eligible}
                onClick={handleOpenDeletionRequestModal}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  py: 1
                }}
              >
                Request Account Deletion
              </Button>
            </Box>
          </Stack>
        )}
      </Paper>

      <AccountDeletionModal
        open={requestModalOpen}
        submitting={submittingRequest}
        errorMessage={submitError}
        onCloseModal={handleCloseDeletionRequestModal}
        onSubmitDeletionRequest={handleSubmitDeletionRequest}
      />

      <Dialog
        open={cancelDialogOpen}
        onClose={(event, closeReason) => {
          if (closeReason !== 'backdropClick' && !cancellingRequest) {
            setCancelDialogOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          <Typography variant="h6" fontWeight={800}>
            Cancel Deletion Request?
          </Typography>
          <IconButton
            aria-label="Close cancel confirmation dialog"
            onClick={() => {
              if (!cancellingRequest) setCancelDialogOpen(false);
            }}
            disabled={cancellingRequest}
            sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}
          >
            <i className="fi fi-rr-cross" style={{ fontSize: 13 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Withdrawing this request will notify the Administrator that you want to keep your Mega Pacific customer account active.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            fullWidth
            disabled={cancellingRequest}
            onClick={handleConfirmCancelDeletionRequest}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#1e3a8a',
              '&:hover': { bgcolor: '#172554' }
            }}
          >
            {cancellingRequest ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <span>Cancelling Request...</span>
              </Stack>
            ) : (
              'Keep My Account Active'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountDeletionSection;
