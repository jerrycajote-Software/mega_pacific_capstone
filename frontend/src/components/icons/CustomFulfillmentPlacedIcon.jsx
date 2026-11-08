import React from 'react';

/**
 * CustomFulfillmentPlacedIcon
 * Industrial Metal & Steel Hardware theme for Order Placed / Queue Logged stage.
 * Features a brushed stainless steel clipboard with riveted aluminum header clip,
 * blueprint technical order sheet, and a 24K brass chronometer timer gauge.
 */
const CustomFulfillmentPlacedIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Order Placed - Metal & Steel Hardware"
      {...props}
    >
      <defs>
        {/* Brushed Steel Board Gradient */}
        <linearGradient id="mpiPlacedBoardGrad" x1="4" y1="3" x2="26" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="35%" stopColor="#334155" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Stainless Steel Outer Bevel */}
        <linearGradient id="mpiPlacedBevelGrad" x1="4" y1="3" x2="4" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Technical Blueprint Order Sheet */}
        <linearGradient id="mpiPlacedSheetGrad" x1="7" y1="8" x2="23" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Chrome Spring Clamp */}
        <linearGradient id="mpiPlacedClampGrad" x1="9" y1="2" x2="21" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* 24K Brass Hardware Chronometer Bezel */}
        <linearGradient id="mpiPlacedBrassGrad" x1="16" y1="16" x2="33" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Dark Carbon Dial Face */}
        <radialGradient id="mpiPlacedDialFace" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="80%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        {/* Drop Shadow Filter */}
        <filter id="mpiPlacedShadow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Heavy Steel Clipboard Base Plate */}
      <rect
        x="4"
        y="4"
        width="22"
        height="28"
        rx="2.5"
        fill="url(#mpiPlacedBoardGrad)"
        stroke="url(#mpiPlacedBevelGrad)"
        strokeWidth="1.2"
        filter="url(#mpiPlacedShadow)"
      />

      {/* Industrial Corner Rivet Studs */}
      <circle cx="6.5" cy="6.5" r="0.8" fill="#cbd5e1" stroke="#334155" strokeWidth="0.4" />
      <circle cx="23.5" cy="6.5" r="0.8" fill="#cbd5e1" stroke="#334155" strokeWidth="0.4" />
      <circle cx="6.5" cy="29.5" r="0.8" fill="#cbd5e1" stroke="#334155" strokeWidth="0.4" />

      {/* Galvanized Specification Order Sheet */}
      <rect
        x="6.5"
        y="7.5"
        width="17"
        height="22"
        rx="1.5"
        fill="url(#mpiPlacedSheetGrad)"
        stroke="#94a3b8"
        strokeWidth="0.6"
      />

      {/* Technical Spec Lines (Coil Width, Length, Profile Type) */}
      <line x1="9" y1="11" x2="19" y2="11" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9" y1="14" x2="21" y2="14" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="17" x2="16" y2="17" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="20" x2="14" y2="20" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="23" x2="13" y2="23" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />

      {/* Heavy Duty Chrome Spring Clamp at Top */}
      <rect
        x="10.5"
        y="2"
        width="9"
        height="4"
        rx="1.2"
        fill="url(#mpiPlacedClampGrad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      <circle cx="15" cy="4" r="1" fill="#1e293b" />

      {/* 24K Brass Industrial Chronometer Watch Gauge on Lower Right */}
      <g filter="url(#mpiPlacedShadow)">
        {/* Brass Bezel Outer */}
        <circle
          cx="24.5"
          cy="24.5"
          r="8.5"
          fill="url(#mpiPlacedBrassGrad)"
          stroke="#fef08a"
          strokeWidth="0.8"
        />

        {/* Steel Retaining Ring */}
        <circle cx="24.5" cy="24.5" r="7.2" stroke="#475569" strokeWidth="0.6" fill="none" />

        {/* Chronometer Crown Pusher */}
        <rect x="23.5" y="14.8" width="2" height="1.8" rx="0.4" fill="#d97706" />

        {/* Dark Carbon Chronometer Dial */}
        <circle cx="24.5" cy="24.5" r="6.2" fill="url(#mpiPlacedDialFace)" />

        {/* Dial Hour Mark Ticks (12, 3, 6, 9) */}
        <line x1="24.5" y1="19.2" x2="24.5" y2="20.4" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="28.8" y1="24.5" x2="29.8" y2="24.5" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="24.5" y1="28.6" x2="24.5" y2="29.8" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="19.2" y1="24.5" x2="20.2" y2="24.5" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />

        {/* Active Intake Clock Sweeps: Hour & Minute Hands */}
        <line x1="24.5" y1="24.5" x2="24.5" y2="21" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="24.5" y1="24.5" x2="27.2" y2="26" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" />

        {/* Center Pivot Pin */}
        <circle cx="24.5" cy="24.5" r="1" fill="#facc15" />
      </g>
    </svg>
  );
};

export default CustomFulfillmentPlacedIcon;
