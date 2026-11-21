import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Collapse
} from '@mui/material';
import { captureReactCrash, submitErrorReportToAdmin, getStoredReporterContext } from '../utils/errorMonitor';
import { getDashboardForRole } from '../hooks/usePreventBackToLogin';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      capturedRecord: null,
      showReportForm: false,
      userDescription: '',
      submittingReport: false,
      reportSubmitted: false,
      reportErrorMessage: ''
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const capturedRecord = captureReactCrash(error, errorInfo);
    this.setState({ capturedRecord });
  }

  handleReloadCurrentPage = () => {
    window.location.reload();
  };

  handleReturnToDashboard = () => {
    const { reporterRole } = getStoredReporterContext();
    const targetDashboard = reporterRole && reporterRole !== 'guest'
      ? getDashboardForRole(reporterRole)
      : '/dashboard';
    window.location.href = targetDashboard;
  };

  handleToggleReportForm = () => {
    this.setState((prev) => ({
      showReportForm: !prev.showReportForm,
      reportErrorMessage: ''
    }));
  };

  handleSendCrashReportToAdmin = async () => {
    if (this.state.submittingReport || this.state.reportSubmitted) return;
    this.setState({ submittingReport: true, reportErrorMessage: '' });

    try {
      const record = this.state.capturedRecord || {
        source: 'frontend_crash',
        errorMessage: this.state.error?.message || String(this.state.error || 'Page render error'),
        stackTrace: this.state.error?.stack || null,
        pageUrl: `${window.location.pathname}${window.location.search}`
      };

      const res = await submitErrorReportToAdmin({
        errorRecord: record,
        userDescription: this.state.userDescription
      });

      this.setState({
        submittingReport: false,
        reportSubmitted: true,
        capturedRecord: {
          ...record,
          traceId: res?.data?.traceId || record.traceId
        }
      });
    } catch (err) {
      this.setState({
        submittingReport: false,
        reportErrorMessage: err?.message || 'Unable to send your error report right now. Please try again.'
      });
    }
  };

  render() {
    if (this.state.hasError) {
      const traceId = this.state.capturedRecord?.traceId;
      const isAdminPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              borderRadius: 3.5,
              border: '1px solid #fee2e2',
              bgcolor: '#fff'
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28
              }}
            >
              <i className="fi fi-rr-exclamation"></i>
            </Box>

            <Typography variant="h5" fontWeight={800} gutterBottom color="text.primary">
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred while loading this page. You can reload the page, return to your dashboard, or report this error to Admin.
            </Typography>

            {traceId && (
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: '#fef2f2',
                    color: '#b91c1c',
                    fontFamily: 'monospace',
                    fontWeight: 800
                  }}
                >
                  Reference Code: {traceId}
                </Typography>
              </Box>
            )}

            {import.meta.env?.DEV && this.state.error && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', borderRadius: 2, textAlign: 'left', overflowX: 'auto' }}>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'monospace', color: '#b91c1c', display: 'block', whiteSpace: 'pre-wrap', fontWeight: 'bold' }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReloadCurrentPage}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3 }}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReturnToDashboard}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3 }}
              >
                Return to Dashboard
              </Button>
              {!isAdminPortal && !this.state.reportSubmitted && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={this.handleToggleReportForm}
                  sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3 }}
                >
                  {this.state.showReportForm ? 'Hide Report Form' : 'Report Error to Admin'}
                </Button>
              )}
            </Box>

            {this.state.reportSubmitted && (
              <Alert severity="success" sx={{ mt: 3, textAlign: 'left', borderRadius: 2.5 }}>
                Your error report has been sent to Admin with Reference Code <strong>{traceId}</strong>. Thank you for reporting this issue.
              </Alert>
            )}

            <Collapse in={this.state.showReportForm && !this.state.reportSubmitted}>
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  textAlign: 'left'
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                  Send Error Details to Admin
                </Typography>
                <Typography variant="caption" color="#475569" sx={{ display: 'block', mb: 1.5 }}>
                  The page URL and error reference code will be included automatically.
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="What were you doing when this happened? (Optional)"
                  placeholder="ex. I opened the checkout page after selecting a roofing color."
                  value={this.state.userDescription}
                  onChange={(e) => this.setState({ userDescription: e.target.value })}
                  disabled={this.state.submittingReport}
                  sx={{ mb: 1.5, bgcolor: '#ffffff' }}
                />

                {this.state.reportErrorMessage && (
                  <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
                    {this.state.reportErrorMessage}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={this.handleSendCrashReportToAdmin}
                  disabled={this.state.submittingReport}
                  startIcon={this.state.submittingReport ? <CircularProgress size={16} color="inherit" /> : undefined}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1 }}
                >
                  {this.state.submittingReport ? 'Sending Error Report...' : 'Send Error Report to Admin'}
                </Button>
              </Box>
            </Collapse>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
