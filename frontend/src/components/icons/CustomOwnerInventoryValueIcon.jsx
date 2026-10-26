import React from 'react';
import './customIcons.css';

/**
 * CustomOwnerInventoryValueIcon
 * Emerald/mint theme representing Owner Total Inventory Capital Valuation with
 * fortified enterprise asset vault safe, stacked bullion bars, and valuation gleam.
 * Adheres strictly to SOLID Single Responsibility Principle.
 */
const CustomOwnerInventoryValueIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-owner-val-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mpiOwnerValSafeGrad" x1="8" y1="10" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="mpiOwnerValDoorGrad" x1="12" y1="14" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="mpiOwnerValDialGrad" x1="18" y1="20" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="mpiOwnerValBarGrad" x1="28" y1="28" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="mpiOwnerValGlow" x="4" y="6" width="40" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#10b981" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Heavy Steel Asset Vault Outer Case */}
      <rect
        x="7"
        y="11"
        width="30"
        height="28"
        rx="5"
        fill="url(#mpiOwnerValSafeGrad)"
        filter="url(#mpiOwnerValGlow)"
        className="mpi-owner-val-vault"
      />

      {/* Recessed Vault Door */}
      <rect
        x="10"
        y="14"
        width="24"
        height="22"
        rx="3"
        fill="url(#mpiOwnerValDoorGrad)"
        stroke="#a7f3d0"
        strokeWidth="1"
      />

      {/* Heavy Safe Hinges on Left */}
      <rect x="8.5" y="17" width="2.5" height="5" rx="1" fill="#047857" />
      <rect x="8.5" y="28" width="2.5" height="5" rx="1" fill="#047857" />

      {/* Combination Dial Wheel */}
      <g className="mpi-owner-val-dial">
        <circle cx="22" cy="25" r="6" fill="url(#mpiOwnerValDialGrad)" stroke="#ffffff" strokeWidth="1" />
        <circle cx="22" cy="25" r="4.5" stroke="#92400e" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
        <circle cx="22" cy="25" r="2.2" fill="#78350f" />
        <line x1="22" y1="19.5" x2="22" y2="21.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
        <line x1="27.5" y1="25" x2="25.5" y2="25" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Safe Handle Spoke */}
      <path d="M22 25L17 28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

      {/* Stacked 24K Gold Bullion Bars in Foreground Right */}
      <g className="mpi-owner-val-bars">
        {/* Lower Bar */}
        <path
          d="M26 36L31 32H43L38 36H26Z"
          fill="url(#mpiOwnerValBarGrad)"
          stroke="#fef08a"
          strokeWidth="0.8"
        />
        <path d="M26 36V39L38 39V36H26Z" fill="#b45309" />
        <path d="M38 36L43 32V35L38 39V36Z" fill="#78350f" />

        {/* Upper Bar */}
        <path
          d="M29 32L33 29H42L38 32H29Z"
          fill="url(#mpiOwnerValBarGrad)"
          stroke="#fef08a"
          strokeWidth="0.8"
        />
      </g>

      {/* Valuation Sparkle */}
      <circle cx="34" cy="14" r="1.5" fill="#ffffff" className="mpi-owner-val-spark" />
      <circle cx="43" cy="27" r="1.2" fill="#fef08a" className="mpi-owner-val-spark" />
    </svg>
  );
};

export default CustomOwnerInventoryValueIcon;
