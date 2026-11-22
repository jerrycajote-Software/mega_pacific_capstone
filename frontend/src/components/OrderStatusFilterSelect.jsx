import React from 'react';
import { Select, MenuItem } from '@mui/material';

// Reusable theme-aware status dropdown filter with color indicators and live item counts
const OrderStatusFilterSelect = ({
  value = 'all',
  onChange,
  options = [],
  counts = {},
  ariaLabel = 'Filter orders by status',
  height = 42,
  borderRadius = '10px',
  minWidth = 195
}) => {
  const handleSelectStatus = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <Select
      size="small"
      value={value}
      onChange={handleSelectStatus}
      displayEmpty
      inputProps={{ 'aria-label': ariaLabel }}
      renderValue={(selected) => {
        const selectedOption = options.find((opt) => opt.value === selected) || options[0];
        if (!selectedOption) return 'All Statuses';
        const count = counts[selectedOption.value] ?? 0;

        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {selectedOption.dotColor && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: selectedOption.dotColor,
                  flexShrink: 0
                }}
              />
            )}
            <span>{selectedOption.label} ({count})</span>
          </span>
        );
      }}
      sx={{
        minWidth: { xs: '100%', sm: minWidth },
        height,
        borderRadius,
        bgcolor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        fontWeight: 600,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: value !== 'all' ? 'primary.main' : 'var(--border)'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: value !== 'all' ? 'primary.main' : 'var(--text-muted)'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
          borderWidth: '1px'
        },
        '& .MuiSelect-icon': {
          color: 'var(--text-muted)'
        }
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            mt: 0.75,
            borderRadius,
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            backgroundImage: 'none',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.28)'
          }
        }
      }}
    >
      {options.map((opt) => (
        <MenuItem
          key={opt.value}
          value={opt.value}
          sx={{
            fontSize: '0.84rem',
            fontWeight: value === opt.value ? 700 : 500,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 1
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {opt.dotColor && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: opt.dotColor,
                  flexShrink: 0
                }}
              />
            )}
            <span>{opt.label}</span>
          </span>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {counts[opt.value] ?? 0}
          </span>
        </MenuItem>
      ))}
    </Select>
  );
};

export default OrderStatusFilterSelect;
