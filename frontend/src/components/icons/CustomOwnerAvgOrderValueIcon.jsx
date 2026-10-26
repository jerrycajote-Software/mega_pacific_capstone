import React from 'react';
import './customIcons.css';

/**
 * CustomOwnerAvgOrderValueIcon
 * Royal violet/purple theme representing Owner Average Order Value (AOV) with precision
 * yield balance scale, ascending fiscal trajectory curve, and radiant metric star.
 * Adheres strictly to SOLID Single Responsibility Principle.
 */
const CustomOwnerAvgOrderValueIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-owner-aov-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mpiOwnerAovBaseGrad" x1="10" y1="12" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="mpiOwnerAovScaleGrad" x1="12" y1="16" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="mpiOwnerAovArrowGrad" x1="8" y1="36" x2="40" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#e9d5ff" />
        </linearGradient>
        <filter id="mpiOwnerAovGlow" x="4" y="6" width="40" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#8b5cf6" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Central Scale Pillar & Base */}
      <rect x="14" y="38" width="20" height="3" rx="1.5" fill="#7c3aed" fillOpacity="0.3" />
      <path d="M24 16V38" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="24,14 21,18 27,18" fill="#a855f7" />

      {/* Tilting Balance Scale Beam */}
      <g className="mpi-owner-aov-beam" filter="url(#mpiOwnerAovGlow)">
        <line x1="11" y1="18" x2="37" y2="15" stroke="url(#mpiOwnerAovScaleGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="16.5" r="2.5" fill="#ffffff" stroke="#7c3aed" strokeWidth="1" />

        {/* Left Pan (Volume Basket) */}
        <line x1="13" y1="18" x2="10" y2="26" stroke="#c084fc" strokeWidth="1" />
        <line x1="13" y1="18" x2="16" y2="26" stroke="#c084fc" strokeWidth="1" />
        <path d="M8 26C8 28.5 10 30 13 30C16 30 18 28.5 18 26H8Z" fill="#7c3aed" stroke="#e9d5ff" strokeWidth="0.8" />
        <circle cx="13" cy="24" r="2" fill="#fef08a" />

        {/* Right Pan (Higher Yield / AOV Basket) */}
        <line x1="35" y1="15" x2="32" y2="23" stroke="#c084fc" strokeWidth="1" />
        <line x1="35" y1="15" x2="38" y2="23" stroke="#c084fc" strokeWidth="1" />
        <path d="M30 23C30 25.5 32 27 35 27C38 27 40 25.5 40 23H30Z" fill="#6d28d9" stroke="#e9d5ff" strokeWidth="0.8" />
        <circle cx="35" cy="20" r="2.5" fill="#fef08a" stroke="#d97706" strokeWidth="0.5" />
      </g>

      {/* Ascending Fiscal Trajectory Vector Curve */}
      <path
        d="M7 36C14 36 18 28 28 17L38 9"
        stroke="url(#mpiOwnerAovArrowGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
        className="mpi-owner-aov-curve"
      />
      <path
        d="M32 9H38V15"
        stroke="url(#mpiOwnerAovArrowGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Radiant Metric Star at Apex */}
      <g className="mpi-owner-aov-star">
        <circle cx="38" cy="9" r="2" fill="#ffffff" />
        <circle cx="38" cy="9" r="4" stroke="#e9d5ff" strokeWidth="0.8" strokeDasharray="1 1" />
      </g>
    </svg>
  );
};

export default CustomOwnerAvgOrderValueIcon;
