import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
} from '@mui/material';
const DENSITY_STEEL = 7850; // kg/m3 standard steel density

const SteelWeightCalculatorModal = ({ open, onClose }) => {
  const [shape, setShape] = useState('plate');
  const [length, setLength] = useState(6.0); // meters
  const [width, setWidth] = useState(1.2);   // meters
  const [thickness, setThickness] = useState(6.0); // mm
  const [quantity, setQuantity] = useState(10);

  // Calculates estimated weight per unit and total
  const calculateWeight = () => {
    const lenM = parseFloat(length) || 0;
    const widthM = parseFloat(width) || 0;
    const thickM = (parseFloat(thickness) || 0) / 1000;
    const qty = parseInt(quantity, 10) || 1;

    let volumeM3 = 0;

    if (shape === 'plate') {
      volumeM3 = lenM * widthM * thickM;
    } else if (shape === 'pipe') {
      // Outer diameter approx, pipe wall thickness
      const outerRadius = (widthM / 2);
      const innerRadius = Math.max(0, outerRadius - thickM);
      volumeM3 = Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2)) * lenM;
    } else if (shape === 'ibeam') {
      // Approx web + flange volume ratio
      volumeM3 = (widthM * thickM * 2 + (widthM - thickM * 2) * thickM) * lenM;
    } else {
      // Round/deformed bar
      const radius = (thickM / 2);
      volumeM3 = Math.PI * Math.pow(radius, 2) * lenM;
    }

    const singleWeightKg = volumeM3 * DENSITY_STEEL;
    const totalWeightKg = singleWeightKg * qty;
    const totalWeightTons = totalWeightKg / 1000;

    return {
      singleKg: singleWeightKg.toFixed(2),
      totalKg: totalWeightKg.toFixed(2),
      totalTons: totalWeightTons.toFixed(3),
    };
  };

  const results = calculateWeight();

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
            <i className="fi fi-rr-calculator"></i>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              Steel Weight & Volume Estimator
            </Typography>
            <Typography variant="caption" sx={{ color: '#93c5fd' }}>
              Standard ASTM A36 / JIS G3101 Density: 7,850 kg/m³
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#93c5fd', '&:hover': { color: '#fff' } }}>
          <i className="fi fi-rr-cross" style={{ fontSize: '14px' }}></i>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
              SELECT MATERIAL SPECIFICATIONS
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Steel Material Shape"
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                >
                  <MenuItem value="plate">Steel Plate / Checkered Sheet</MenuItem>
                  <MenuItem value="ibeam">I-Beam / Wide Flange Profile</MenuItem>
                  <MenuItem value="pipe">Hollow Tubular / Pipe Section</MenuItem>
                  <MenuItem value="deformed">Deformed Round Rebar</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Length per piece (Meters)"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  inputProps={{ step: 0.5, min: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label={shape === 'deformed' ? 'Diameter (mm)' : 'Width / Outer Diameter (Meters)'}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  inputProps={{ step: 0.1, min: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Thickness (mm)"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  inputProps={{ step: 0.5, min: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Total Pieces / Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: '#1e293b',
                color: '#ffffff',
                borderRadius: 3,
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Chip
                  label="CALCULATED LOAD METRICS"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(79,119,45,0.4)',
                    color: '#a3e635',
                    fontWeight: 'bold',
                    fontSize: '0.65rem',
                    mb: 2,
                  }}
                />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    ESTIMATED SINGLE UNIT WEIGHT
                  </Typography>
                  <Typography variant="h5" fontWeight="900" sx={{ color: '#38bdf8' }}>
                    {results.singleKg} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>kg / pc</span>
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#334155', my: 1.5 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    TOTAL BATCH WEIGHT ({quantity} pcs)
                  </Typography>
                  <Typography variant="h4" fontWeight="900" sx={{ color: '#a3e635' }}>
                    {results.totalKg} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>kg</span>
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                    ≈ <strong>{results.totalTons} Metric Tons</strong>
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <i className="fi fi-rr-truck-side" style={{ color: '#fbbf24', fontSize: '18px' }}></i>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                    {parseFloat(results.totalTons) > 10
                      ? 'Requires Heavy Duty Boom Truck / Flatbed Trailer (Subic Depot Depot Available)'
                      : 'Standard 6-Wheeler Freight Available'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default SteelWeightCalculatorModal;
