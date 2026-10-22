import React from 'react';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';

const CostEstimatorPanel = ({ steps, setQty, removePart, grandTotal, installedCount, resetAll }) => {
  const installedSteps = steps.filter(s => s.status === 'installed');

  return (
    <Box
      sx={{
        width: 320,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" fontWeight={800}>
          Cost Estimation
        </Typography>
        <IconButton size="small" onClick={resetAll} sx={{ color: '#64748b' }}>
          <i className="fi fi-rr-trash" style={{ fontSize: '14px' }}></i>
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {installedSteps.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
            <i className="fi fi-rr-box" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
            <Typography variant="caption">No materials installed yet.</Typography>
          </Box>
        ) : (
          installedSteps.map((step) => (
            <Box key={step.id} sx={{ mb: 2, pb: 2, borderBottom: '1px dashed #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#1e293b' }}>
                  {step.name}
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#1e293b' }}>
                  ₱{step.subtotal.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                ₱{step.unitPrice.toLocaleString()} {step.unit}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Qty:</Typography>
                  <IconButton size="small" onClick={() => setQty(step.id, step.qty - 1)} disabled={step.qty <= 1} sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.25 }}>
                    <i className="fi fi-rr-minus" style={{ fontSize: '8px' }}></i>
                  </IconButton>
                  <TextField
                    value={step.qty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setQty(step.id, val);
                    }}
                    variant="standard"
                    inputProps={{ style: { textAlign: 'center', fontSize: '0.75rem', width: 24, padding: 0 } }}
                    sx={{ '& .MuiInput-underline:before': { borderBottom: 'none' } }}
                  />
                  <IconButton size="small" onClick={() => setQty(step.id, step.qty + 1)} sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.25 }}>
                    <i className="fi fi-rr-plus" style={{ fontSize: '8px' }}></i>
                  </IconButton>
                </Box>
                <Button size="small" color="error" onClick={() => removePart(step.id)} sx={{ textTransform: 'none', fontSize: '0.65rem', minWidth: 0, p: 0 }}>
                  Remove
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" fontWeight={700} color="text.secondary">Total Estimate</Typography>
          <Typography variant="h6" fontWeight={900} color="primary.main">₱{grandTotal.toLocaleString()}</Typography>
        </Box>
        <Button fullWidth variant="contained" disabled={installedCount === 0} sx={{ py: 1.5, fontWeight: 700, textTransform: 'none' }}>
          Request Official Quote
        </Button>
      </Box>
    </Box>
  );
};

export default CostEstimatorPanel;
