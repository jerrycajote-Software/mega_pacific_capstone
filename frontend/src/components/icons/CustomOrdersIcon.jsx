import React from 'react';
import './customIcons.css';

/**
 * CustomOrdersIcon
 * Full-color animated icon for Orders in Sales layout.
 * Features a commercial shopping carrier cart, floating confirmed order invoice,
 * a pulsing green verification checkmark badge, and rotating alloy wheels.
 */
const CustomOrdersIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Orders Icon"
    >
      <defs>
        <linearGradient id="mpiOrderCartGrad" x1="4" y1="9" x2="26" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="mpiOrderDocGrad" x1="10" y1="4" x2="22" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id="mpiOrderBadgeGrad" x1="17" y1="3" x2="27" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <radialGradient id="mpiOrderWheelGrad" cx="0.5" cy="0.5" r="0.5" fx="0.3" fy="0.3">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>

      {/* Floating Confirmed Order Invoice */}
      <g className="mpi-order-doc">
        <rect x="9" y="4" width="11" height="13" rx="2" fill="url(#mpiOrderDocGrad)" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="12" y1="8" x2="17" y2="8" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="11" x2="16" y2="11" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="14" x2="15" y2="14" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Shopping Cart Basket Body */}
      <path
        d="M3 5H6.5L9.5 19.5H23L26 9.5H8.2"
        stroke="url(#mpiOrderCartGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 14.5H24"
        stroke="#38bdf8"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Left Wheel */}
      <g className="mpi-order-wheel" style={{ transformOrigin: '11.5px 25.5px' }}>
        <circle cx="11.5" cy="25.5" r="3.2" fill="url(#mpiOrderWheelGrad)" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="11.5" cy="25.5" r="1.1" fill="#ffffff" />
      </g>

      {/* Right Wheel */}
      <g className="mpi-order-wheel" style={{ transformOrigin: '21.5px 25.5px' }}>
        <circle cx="21.5" cy="25.5" r="3.2" fill="url(#mpiOrderWheelGrad)" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="21.5" cy="25.5" r="1.1" fill="#ffffff" />
      </g>

      {/* Glowing Checkmark Verification Badge */}
      <g className="mpi-order-badge">
        <circle cx="22.5" cy="8.5" r="5.5" fill="url(#mpiOrderBadgeGrad)" stroke="#ffffff" strokeWidth="1.4" />
        <path d="M20 8.5L21.8 10.3L25 6.8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export default CustomOrdersIcon;
