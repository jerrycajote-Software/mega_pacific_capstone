import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { CustomCloseIcon } from '../icons';
import { analyzeApplicationError } from '../../utils/errorSolutionAdvisor';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' }
];

const SOURCE_LABELS = {
  frontend_crash: 'Page Crash',
  frontend_runtime: 'App Runtime Error',
  api_error: 'Server / API Error',
  backend_error: 'Backend Error',
  user_reported: 'User Reported'
};

// Extract the first project file path from the stored stack trace for quick Admin debugging
const extractPrimarySourceFile = (stack) => {
  if (!stack) return null;
  const match = String(stack).match(/((?:frontend\/src|backend)\/[^()\s]+:\d+(?::\d+)?(?:\s*\([^)]+\))?)/i);
  return match ? match[1] : null;
};

// Detailed Admin modal for inspecting full error trace diagnostics and updating resolution status
const ErrorReportDetailModal = ({ open, onClose, report, onUpdated }) => {
  const [status, setStatus] = useState('open');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copiedTrace, setCopiedTrace] = useState(false);

  useEffect(() => {
    if (open && report) {
      setStatus(report.status || 'open');
      setAdminNotes(report.adminNotes || '');
      setSaveError('');
      setCopiedTrace(false);
    }
  }, [open, report]);

  const handleModalCloseRequest = (_event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    if (onClose) onClose();
  };

  const handleCopyFullTrace = async () => {
    if (!report) return;
    const primarySource = extractPrimarySourceFile(report.stackTrace);
    const liveDiagnosis = analyzeApplicationError({
      source: report.source,
      errorMessage: report.errorMessage,
      stackTrace: report.stackTrace,
      componentStack: report.componentStack,
      apiEndpoint: report.apiEndpoint,
      httpStatus: report.httpStatus,
      sourceFile: primarySource
    });

    const summaryLines = [
      `Reference Code: ${report.traceId}`,
      `Portal / Role: ${report.portal} (${report.reporterRole})`,
      `Reporter: ${report.reporterName || 'Unknown'} <${report.reporterEmail || 'No email'}>`,
      `Page URL: ${report.pageUrl}`,
      report.apiEndpoint ? `Failed API: ${report.apiEndpoint} (HTTP ${report.httpStatus || 'N/A'})` : null,
      primarySource ? `Problem Source File: ${primarySource}` : null,
      `Reported At: ${new Date(report.createdAt).toLocaleString('en-PH')}`,
      `User Note: ${report.userDescription || 'None'}`,
      `Error Message: ${report.errorMessage}`,
      liveDiagnosis?.category ? `\nDiagnosis Category: ${liveDiagnosis.category}` : null,
      liveDiagnosis?.summary ? `Likely Cause: ${liveDiagnosis.summary}` : null,
      liveDiagnosis?.possibleSolutions?.length
        ? `Possible Solutions:\n${liveDiagnosis.possibleSolutions.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}`
        : null,
      report.stackTrace ? `\nStack Trace:\n${report.stackTrace}` : null,
      report.componentStack ? `\nReact Component Stack:\n${report.componentStack}` : null
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(summaryLines);
      setCopiedTrace(true);
      setTimeout(() => setCopiedTrace(false), 2500);
    } catch {
      setSaveError('Unable to copy trace details to clipboard in this browser.');
    }
  };

  const handleSaveErrorReportStatus = async () => {
    if (!report || saving) return;
    setSaving(true);
    setSaveError('');

    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.patch(
        `${API_URL}/api/admin/error-reports/${report.id}`,
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success && res.data?.data) {
        if (onUpdated) onUpdated(res.data.data);
        if (onClose) onClose();
      }
    } catch (err) {
      setSaveError(
        err?.response?.data?.message || 'Failed to update this error report. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!report) return null;

  const suspectedSourceFile = extractPrimarySourceFile(report.stackTrace);

  // Compute automated plain-English diagnosis and step-by-step fix guidance for Admin staff
  const automatedDiagnosis = analyzeApplicationError({
    source: report.source,
    errorMessage: report.errorMessage,
    stackTrace: report.stackTrace,
    componentStack: report.componentStack,
    apiEndpoint: report.apiEndpoint,
    httpStatus: report.httpStatus,
    sourceFile: suspectedSourceFile
  });

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleModalCloseRequest}
      disableEscapeKeyDown
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          overflow: 'hidden',
          bgcolor: 'var(--bg-secondary, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          border: '1px solid var(--border-light, #e2e8f0)'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.25,
          borderBottom: '1px solid var(--border-light, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" fontWeight={800}>
              Error Report #{report.id}
            </Typography>
            <Chip
              label={report.traceId}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 800,
                bgcolor: 'rgba(239, 68, 68, 0.14)',
                color: '#ef4444'
              }}
            />
            <Chip
              label={SOURCE_LABELS[report.source] || report.source}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)', display: 'block', mt: 0.4 }}>
            Reported on {new Date(report.createdAt).toLocaleString('en-PH')}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close error report details"
          size="small"
          sx={{ color: 'var(--text-muted, #64748b)', bgcolor: 'rgba(148,163,184,0.14)' }}
        >
          <CustomCloseIcon size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {/* Reporter and Route Metadata */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5,
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'rgba(148, 163, 184, 0.08)',
            border: '1px solid var(--border-light, #e2e8f0)'
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)', display: 'block' }}>
              Reported By
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {report.reporterName || 'Unidentified User'} ({report.reporterRole})
            </Typography>
            {report.reporterEmail && (
              <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)' }}>
                {report.reporterEmail}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)', display: 'block' }}>
              Portal & Page
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
              {report.portal} Portal
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {report.pageUrl}
            </Typography>
          </Box>

          {report.apiEndpoint && (
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)', display: 'block' }}>
                Failed Backend Request
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>
                {report.apiEndpoint} {report.httpStatus ? `(HTTP ${report.httpStatus})` : '(Network Error)'}
              </Typography>
            </Box>
          )}

          {suspectedSourceFile && (
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)', display: 'block' }}>
                Problem Source File
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#d97706' }}>
                {suspectedSourceFile}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Automated Diagnosis & Possible Solutions (Admin-only) */}
        {automatedDiagnosis && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'var(--role-accent-soft, rgba(79, 70, 229, 0.08))',
              border: '1px solid var(--role-accent-border, rgba(79, 70, 229, 0.28))'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'var(--text-primary)' }}>
                Automated Diagnosis &amp; Possible Solutions
              </Typography>
              <Chip
                label={automatedDiagnosis.category}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: 'var(--bg-secondary)',
                  color: 'var(--role-accent-text, #4338ca)',
                  border: '1px solid var(--role-accent-border, rgba(79, 70, 229, 0.35))'
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 1.25 }}>
              {automatedDiagnosis.summary}
            </Typography>

            {Array.isArray(automatedDiagnosis.possibleSolutions) && automatedDiagnosis.possibleSolutions.length > 0 && (
              <Box component="ol" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.65 }}>
                {automatedDiagnosis.possibleSolutions.map((solution, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body2"
                    sx={{ color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.82rem' }}
                  >
                    {solution}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* End User Description */}
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>
            User Description
          </Typography>
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {report.userDescription || 'No additional description was provided by the user.'}
            </Typography>
          </Box>
        </Box>

        {/* Technical Error Trace */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>
              Technical Trace Details
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleCopyFullTrace}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              {copiedTrace ? 'Copied Trace Details' : 'Copy Full Trace'}
            </Button>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#0f172a',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '0.76rem',
              overflowX: 'auto',
              maxHeight: 240,
              overflowY: 'auto'
            }}
          >
            <Typography component="div" sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#fca5a5', fontWeight: 700, mb: 1 }}>
              {report.errorMessage}
            </Typography>
            {report.stackTrace && (
              <pre style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#cbd5e1' }}>
                {report.stackTrace}
              </pre>
            )}
            {report.componentStack && (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#93c5fd' }}>
                {`React Component Tree:\n${report.componentStack}`}
              </pre>
            )}
          </Box>

          {report.browserInfo && (
            <Typography variant="caption" sx={{ color: 'var(--text-muted, #64748b)', display: 'block', mt: 0.75, wordBreak: 'break-word' }}>
              Environment: {report.browserInfo}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Admin Resolution Controls */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' }, gap: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Report Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            label="Admin Resolution Notes"
            placeholder="ex. Fixed React hook order in Checkout.jsx and verified in production build."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            disabled={saving}
          />
        </Box>

        {saveError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {saveError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveErrorReportStatus}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3, py: 1 }}
        >
          {saving ? 'Saving Status...' : 'Save Report Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorReportDetailModal;
