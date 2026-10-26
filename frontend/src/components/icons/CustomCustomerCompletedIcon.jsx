import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerCompletedIcon
 * Full-color animated vector icon for Customer "Completed" KPI.
 * Features an emerald triumph rosette fulfillment badge, golden victory ribbons,
 * a bold beveled checkmark with gleam aura, and radiant achievement sparkles.
 */
const CustomCustomerCompletedIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-cust-comp-icon ${className}`}
      role="img"
      aria-label="Customer Orders Completed"
      {...props}
    >
      <defs>
        <linearGradient id="mpiCustCompSealGrad" x1="10" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="mpiCustCompRibbonGrad" x1="16" y1="28" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiCustCompCheckGrad" x1="16" y1="18" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>

        <filter id="mpiCustCompGlow" x="4" y="4" width="40" height="42" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#10b981" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Golden Victory Hanging Ribbons at Base */}
      <g>
        {/* Left Ribbon */}
        <path
          d="M17 28L13 42L18 39L23 42L21 28"
          fill="url(#mpiCustCompRibbonGrad)"
          stroke="#92400e"
          strokeWidth="0.8"
        />
        {/* Right Ribbon */}
        <path
          d="M27 28L25 42L30 39L35 42L31 28"
          fill="url(#mpiCustCompRibbonGrad)"
          stroke="#92400e"
          strokeWidth="0.8"
        />
      </g>

      {/* Scalloped / Beveled Rosette Outer Seal */}
      <circle
        cx="24"
        cy="21"
        r="16.5"
        fill="url(#mpiCustCompSealGrad)"
        stroke="#065f46"
        strokeWidth="1.2"
        filter="url(#mpiCustCompGlow)"
      />

      {/* Decorative Bezel Inset Ring */}
      <circle
        cx="24"
        cy="21"
        r="13.5"
        stroke="#6ee7b7"
        strokeWidth="1.2"
        strokeDasharray="3 1.5"
        opacity="0.85"
      />

      {/* Inner Emerald Core Disc */}
      <circle
        cx="24"
        cy="21"
        r="11"
        fill="#047857"
        stroke="#a7f3d0"
        strokeWidth="0.8"
      />

      {/* Bold 3D Checkmark */}
      <g className="mpi-cust-comp-check">
        {/* Check Shadow */}
        <path
          d="M18 21.5L22 25.5L30 16.5"
          stroke="#064e3b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Check Face */}
        <path
          d="M18 21L22 25L30 16"
          stroke="url(#mpiCustCompCheckGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Radiant Apex Sparkle Star */}
      <g className="mpi-cust-comp-spark">
        <path
          d="M36 8L37.2 11.5L40.5 12.8L37.2 14.1L36 17.5L34.8 14.1L31.5 12.8L34.8 11.5L36 8Z"
          fill="#fef08a"
          stroke="#f59e0b"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
};

export default CustomCustomerCompletedIcon;
