import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #fee2e2',
              bgcolor: '#fff',
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
                fontSize: 28,
              }}
            >
              <i className="fi fi-rr-exclamation"></i>
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred while loading this page. Please try refreshing or return home.
            </Typography>
            {import.meta.env?.DEV && this.state.error && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#fef2f2', borderRadius: 2, textAlign: 'left', overflowX: 'auto' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#b91c1c', display: 'block', whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReload}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                onClick={() => { window.location.href = '/dashboard'; }}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
              >
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
