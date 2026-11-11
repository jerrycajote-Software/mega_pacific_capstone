import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Collapse,
  Divider
} from '@mui/material';
import {
  CustomInfoIcon,
  CustomLocalGasStationIcon,
  CustomLocationOnIcon
} from '../icons';
import { DEFAULT_VEHICLE_RULES } from '../../utils/deliveryFeeCalculator';

const formatTopLoadSummary = (vehicle) => {
  const topTiers = (vehicle?.tlaTiers ?? []).filter((t) => t.minLength > vehicle.maxBedLength);
  if (vehicle?.code === 'TRACTOR_HEAD') {
    const surcharge = topTiers[0]?.tla ?? 8000;
    return `Case-to-case / Heavy Rigging: ₱${Number(surcharge).toLocaleString()}`;
  }
  const tierLabels = topTiers.map((t) => {
    const minStr = Number.isInteger(t.minLength) ? t.minLength : t.minLength;
    return `${minStr}–${t.maxLength}m: ₱${Number(t.tla || 0).toLocaleString()}`;
  });
  return `${tierLabels.join(' | ')} (Max ${vehicle?.maxTopWeight ?? 0} mt)`;
};

const DeliveryFleetRateControls = ({
  deliverySettings,
  setDeliverySettings,
  savingDelivery,
  showVehicleRatesModal,
  handleToggleVehicleMatrix,
  handleSaveDeliverySettings,
  handleToggleDefaultFleetRates,
  handleRestoreDefaultFleetRates,
  handleUpdateVehicleField,
  handleUpdateVehicleTierFee
}) => {
  const useDefault = deliverySettings?.useDefaultFleetRates !== false;
  const displayedVehicles = useDefault
    ? (deliverySettings?.defaultVehicleSpecs ?? DEFAULT_VEHICLE_RULES)
    : (deliverySettings?.customVehicleSpecs ?? deliverySettings?.vehicleSpecs ?? DEFAULT_VEHICLE_RULES);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CustomLocalGasStationIcon size={26} color="#16a34a" />
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                Delivery Fee & Fuel Rate Controls
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Origin: <strong>Mega Pacific Imus Plant</strong> • Live formula parameters for all customer orders
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleToggleVehicleMatrix}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
          >
            {showVehicleRatesModal ? 'Hide Vehicle Rates' : 'View Vehicle Rates'}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveDeliverySettings}
            disabled={savingDelivery}
            startIcon={savingDelivery ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5, bgcolor: 'primary.main' }}
          >
            {savingDelivery ? 'Saving Settings...' : 'Save Delivery Settings'}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Current Diesel Price (DP)"
            value={deliverySettings?.dieselPrice ?? 105}
            onChange={(e) => setDeliverySettings((prev) => ({ ...prev, dieselPrice: e.target.value }))}
            InputProps={{
              startAdornment: <InputAdornment position="start">₱</InputAdornment>,
              endAdornment: <InputAdornment position="end">/ Liter</InputAdornment>
            }}
            helperText="Gas station unit price (Guidelines: ₱105.00)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Admin Cost / PMS Rate"
            value={deliverySettings?.adminCostPct ?? 20}
            onChange={(e) => setDeliverySettings((prev) => ({ ...prev, adminCostPct: e.target.value }))}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
            helperText="Operation cost & PMS (Guidelines: 20%)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            disabled
            label="Manufacturing Plant Origin"
            value={deliverySettings?.plantOrigin ?? 'Mega Pacific Imus Plant (Imus, Cavite)'}
            InputProps={{
              startAdornment: <InputAdornment position="start"><CustomLocationOnIcon size={14} color="#64748b" /></InputAdornment>
            }}
            helperText="Origin for CALABARZON route calculations"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(deliverySettings?.includeDepreciation)}
                onChange={(e) => setDeliverySettings((prev) => ({ ...prev, includeDepreciation: e.target.checked }))}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>Vehicle Wear & Tear</Typography>
                <Typography variant="caption" color="text.secondary">Include in base subtotal</Typography>
              </Box>
            }
          />
        </Grid>
      </Grid>

      <Collapse in={showVehicleRatesModal} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <CustomInfoIcon size={15} color="#2563EB" />
            <Typography variant="subtitle2" fontWeight={700}>
              {useDefault
                ? 'Delivery Fleet Rate Reference Table (from Guidelines)'
                : 'Delivery Fleet Rate Matrix (Custom Editable Mode)'}
            </Typography>
            <Chip
              size="small"
              label={useDefault ? 'Default Guidelines Active' : 'Custom Fleet Rates Active'}
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: useDefault ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.14)',
                color: useDefault ? '#059669' : '#d97706'
              }}
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {!useDefault && (
              <Button
                variant="outlined"
                size="small"
                color="warning"
                onClick={handleRestoreDefaultFleetRates}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
              >
                Restore Default Fleet Rates
              </Button>
            )}
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  size="small"
                  checked={useDefault}
                  onChange={(e) => handleToggleDefaultFleetRates(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ display: 'block', lineHeight: 1.2 }}>
                    Use Default Guideline Rates
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                    {useDefault ? 'Turn off to edit truck rates' : 'Turn on to lock default rates'}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc' }}>
              <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Truck Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fuel Economy (KL)</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Manpower (TM)</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Bed Load Capacity</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Top Load Capacity & Surcharge (TLA)</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Depreciation (VD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontSize: '0.75rem' }}>
              {displayedVehicles.map((vehicle, vIdx) => (
                <TableRow key={vehicle.code || vIdx} hover>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{vehicle.type}</TableCell>
                  <TableCell>
                    {useDefault ? (
                      `${vehicle.kl} km/L`
                    ) : (
                      <TextField
                        size="small"
                        type="number"
                        value={vehicle.kl}
                        onChange={(e) => handleUpdateVehicleField(vehicle.code, 'kl', e.target.value)}
                        inputProps={{ min: 0.5, step: 0.5, style: { padding: '4px 8px', fontSize: '0.78rem', width: 58 } }}
                        InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption">km/L</Typography></InputAdornment> }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {useDefault ? (
                      `₱${Number(vehicle.manpower || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      <TextField
                        size="small"
                        type="number"
                        value={vehicle.manpower}
                        onChange={(e) => handleUpdateVehicleField(vehicle.code, 'manpower', e.target.value)}
                        inputProps={{ min: 0, step: 100, style: { padding: '4px 8px', fontSize: '0.78rem', width: 78 } }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="caption">₱</Typography></InputAdornment> }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {useDefault ? (
                      `Up to ${vehicle.maxBedLength}m, ${vehicle.maxBedWeight} mt`
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          type="number"
                          label="Max Length"
                          value={vehicle.maxBedLength}
                          onChange={(e) => handleUpdateVehicleField(vehicle.code, 'maxBedLength', e.target.value)}
                          inputProps={{ min: 1, step: 0.5, style: { padding: '4px 6px', fontSize: '0.75rem', width: 48 } }}
                          InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption">m</Typography></InputAdornment> }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Max Weight"
                          value={vehicle.maxBedWeight}
                          onChange={(e) => handleUpdateVehicleField(vehicle.code, 'maxBedWeight', e.target.value)}
                          inputProps={{ min: 0.5, step: 0.5, style: { padding: '4px 6px', fontSize: '0.75rem', width: 48 } }}
                          InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption">mt</Typography></InputAdornment> }}
                        />
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>
                    {useDefault ? (
                      formatTopLoadSummary(vehicle)
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        {(vehicle.tlaTiers ?? []).map((tier, tIdx) => {
                          if (tier.minLength <= vehicle.maxBedLength) return null;
                          const rangeLabel = vehicle.code === 'TRACTOR_HEAD'
                            ? 'Rigging Fee'
                            : `${tier.minLength}–${tier.maxLength}m`;
                          return (
                            <TextField
                              key={tIdx}
                              size="small"
                              type="number"
                              label={rangeLabel}
                              value={tier.tla}
                              onChange={(e) => handleUpdateVehicleTierFee(vehicle.code, tIdx, e.target.value)}
                              inputProps={{ min: 0, step: 250, style: { padding: '4px 6px', fontSize: '0.75rem', width: 68 } }}
                              InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="caption">₱</Typography></InputAdornment> }}
                            />
                          );
                        })}
                        {vehicle.code !== 'TRACTOR_HEAD' && (
                          <TextField
                            size="small"
                            type="number"
                            label="Max Top Wt"
                            value={vehicle.maxTopWeight}
                            onChange={(e) => handleUpdateVehicleField(vehicle.code, 'maxTopWeight', e.target.value)}
                            inputProps={{ min: 0.5, step: 0.5, style: { padding: '4px 6px', fontSize: '0.75rem', width: 48 } }}
                            InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption">mt</Typography></InputAdornment> }}
                          />
                        )}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>
                    {useDefault ? (
                      `₱${Number(vehicle.depreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      <TextField
                        size="small"
                        type="number"
                        value={vehicle.depreciation}
                        onChange={(e) => handleUpdateVehicleField(vehicle.code, 'depreciation', e.target.value)}
                        inputProps={{ min: 0, step: 500, style: { padding: '4px 8px', fontSize: '0.78rem', width: 82 } }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="caption">₱</Typography></InputAdornment> }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );
};

export default DeliveryFleetRateControls;

