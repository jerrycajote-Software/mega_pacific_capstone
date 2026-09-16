import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
const QuickRfqModal = ({ open, onClose, product = null }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    materialType: product?.type || 'Structural Steel',
    productName: product?.name || '',
    quantity: '10',
    unit: product?.unit || 'pcs',
    cutToSize: 'No',
    customLength: '',
    deliveryLocation: 'Valenzuela Depot Pickup',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setToastOpen(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          border: '1px solid #e0e7ef',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              display: 'flex',
              fontSize: '20px',
            }}
          >
            <i className="fi fi-rr-document-signed"></i>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              Industrial Trade RFQ — Request For Quote
            </Typography>
            <Typography variant="caption" sx={{ color: '#93c5fd' }}>
              Direct contractor pricing, mill certificates & cut-to-size options
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#93c5fd', '&:hover': { color: '#ffffff' } }}
        >
          <i className="fi fi-rr-cross" style={{ fontSize: '14px' }}></i>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
        {submitted ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ fontSize: 56, color: '#16a34a', mb: 2 }}>
              <i className="fi fi-sr-check-circle"></i>
            </Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              Quote Inquiry Received!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
              Our sales engineering team at Mega Pacific Subic / Valenzuela Depot will issue an official trade quotation with volume discounts within 1 business hour.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {product && (
              <Alert
                severity="info"
                icon={<RequestQuoteIcon />}
                sx={{ mb: 3, borderRadius: 2, bgcolor: '#eef2ff', borderColor: '#c7d2fe' }}
              >
                Inquiring for: <strong>{product.name}</strong> ({product.type})
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Company / Project Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Builders Inc."
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Person Name"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Engr. Juan Cruz"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. procurement@apex.ph"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +63 917 123 4567"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Material Specification / Type"
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleChange}
                  select
                >
                  <option value="Structural Steel">Structural Steel (I-Beams, Wide Flange)</option>
                  <option value="Deformed Steel Bars">Deformed Steel Bars (Grade 40/60)</option>
                  <option value="Steel Pipes & Tubes">Steel Pipes & Hollow Structural Sections</option>
                  <option value="Roofing & Cladding">Roofing & Decking Sheets</option>
                  <option value="Steel Plates & Sheets">Steel Plates & Checkered Sheets</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estimated Quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Unit of Measure"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  select
                >
                  <option value="pcs">Pieces (Pcs)</option>
                  <option value="tons">Metric Tons (MT)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="bundles">Bundles</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cut-to-Size Service Needed?"
                  name="cutToSize"
                  value={formData.cutToSize}
                  onChange={handleChange}
                  select
                >
                  <option value="No">No — Standard Length (6m / 12m)</option>
                  <option value="Yes">Yes — Custom Cut-to-Size Required</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Preferred Delivery / Fulfillment"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  select
                >
                  <option value="Valenzuela Depot Pickup">Valenzuela Depot Pickup</option>
                  <option value="Subic Warehouse Pickup">Subic Depot Pickup</option>
                  <option value="Site Delivery (NCR / Central Luzon)">Site Delivery (NCR / Central Luzon)</option>
                  <option value="Port Container Loading">Port Container Loading</option>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Special Specifications / Project Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Mention steel grade requirements (e.g., ASTM A36, JIS G3101), coating requirements (Galvanized/Primer), or target delivery date..."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button onClick={onClose} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#4f772d',
                  color: '#ffffff',
                  px: 4,
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#3d5c22' },
                }}
              >
                Submit Trade Quote Request
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickRfqModal;
