import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAdminTheme } from '../context/ThemeContext';

/**
 * ThemeSwitcher — Admin panel dark/light toggle button.
 * Drop this into any admin header or sidebar.
 */
const ThemeSwitcher = ({ size = 'medium', sx = {} }) => {
  const { mode, toggleTheme } = useAdminTheme();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} arrow>
      <IconButton
        onClick={toggleTheme}
        size={size}
        aria-label="toggle theme"
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
          color: isDark ? '#fbbf24' : '#475569',
          transition: 'all 0.25s ease',
          '&:hover': {
            background: isDark
              ? 'rgba(251,191,36,0.1)'
              : 'rgba(71,85,105,0.08)',
            borderColor: isDark ? '#fbbf24' : '#475569',
            transform: 'rotate(20deg)',
          },
          ...sx,
        }}
      >
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;
