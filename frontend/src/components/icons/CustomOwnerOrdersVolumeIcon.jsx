import React from 'react';
import './customIcons.css';

/**
 * CustomOwnerOrdersVolumeIcon
 * Rose/coral theme representing Owner Total Orders Volume with executive order fulfillment
 * basket, loaded parcels, verified manifest document, and rolling alloy wheels.
 * Adheres strictly to SOLID Single Responsibility Principle.
 */
const CustomOwnerOrdersVolumeIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-owner-vol-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mpiOwnerVolCartGrad" x1="10" y1="14" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="mpiOwnerVolBoxGrad" x1="16" y1="12" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="mpiOwnerVolDocGrad" x1="24" y1="8" x2="38" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>
        <filter id="mpiOwnerVolGlow" x="4" y="6" width="40" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f43f5e" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Cart Handle Bar */}
      <path
        d="M7 13H12L15 28H35L39 16H16"
        stroke="url(#mpiOwnerVolCartGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#mpiOwnerVolGlow)"
        className="mpi-owner-vol-frame"
      />

      {/* Order Dispatch Parcel inside cart */}
      <g className="mpi-owner-vol-box">
        <rect
          x="16"
          y="15"
          width="13"
          height="12"
          rx="2"
          fill="url(#mpiOwnerVolBoxGrad)"
          stroke="#ffe4e6"
          strokeWidth="0.8"
        />
        {/* Ribbon cross on parcel */}
        <line x1="22.5" y1="15" x2="22.5" y2="27" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        <line x1="16" y1="21" x2="29" y2="21" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
      </g>

      {/* Verified Manifest Document in Cart */}
      <g className="mpi-owner-vol-doc">
        <path
          d="M26 9H35C36 9 37 10 37 11V23C37 24 36 25 35 25H26C25 25 24 24 24 23V11C24 10 25 9 26 9Z"
          fill="url(#mpiOwnerVolDocGrad)"
          stroke="#f43f5e"
          strokeWidth="1"
        />
        {/* Itemized Docket Lines */}
        <line x1="27" y1="13" x2="34" y2="13" stroke="#e11d48" strokeWidth="1" strokeLinecap="round" />
        <line x1="27" y1="16" x2="33" y2="16" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="27" y1="19" x2="31" y2="19" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />

        {/* Emerald Checkmark Badge on Document */}
        <circle cx="34" cy="21" r="3.2" fill="#10b981" />
        <path d="M32.5 21L33.5 22L35.5 20" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Cart Lower Chassis Frame */}
      <path d="M16 28L18 33H33L35 28" stroke="url(#mpiOwnerVolCartGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Rolling Alloy Wheels */}
      <g className="mpi-owner-vol-wheel-left">
        <circle cx="19" cy="37" r="3.5" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
        <circle cx="19" cy="37" r="1.5" fill="#ffffff" />
      </g>
      <g className="mpi-owner-vol-wheel-right">
        <circle cx="33" cy="37" r="3.5" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
        <circle cx="33" cy="37" r="1.5" fill="#ffffff" />
      </g>

      {/* Speed / Velocity Micro-Dash */}
      <line x1="6" y1="21" x2="10" y2="21" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" className="mpi-owner-vol-dash" />
    </svg>
  );
};

export default CustomOwnerOrdersVolumeIcon;
