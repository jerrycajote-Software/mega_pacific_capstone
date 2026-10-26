import React from 'react';
import './customIcons.css';

/**
 * CustomRefundsIcon
 * Full-color animated icon for Refunds in Finance layout.
 * Features rotating circular return arrows symbolizing reimbursement flow,
 * and a pulsing centered currency token.
 */
const CustomRefundsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Refunds Icon"
    >
      <defs>
        <linearGradient id="mpiRefundArrowBlue" x1="6" y1="4" x2="26" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="mpiRefundArrowAmber" x1="26" y1="16" x2="6" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <radialGradient id="mpiRefundCenterGrad" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
      </defs>

      {/* Rotating Dual Return Arrows */}
      <g className="mpi-refund-arrows">
        {/* Top/Right Blue Curved Arrow */}
        <path
          d="M16 5C22.0751 5 27 9.92487 27 16C27 17.5 26.7 18.9 26.2 20.2"
          stroke="url(#mpiRefundArrowBlue)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M19 2L15 5.5L19 9"
          stroke="url(#mpiRefundArrowBlue)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bottom/Left Amber Curved Arrow */}
        <path
          d="M16 27C9.92487 27 5 22.0751 5 16C5 14.5 5.3 13.1 5.8 11.8"
          stroke="url(#mpiRefundArrowAmber)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M13 30L17 26.5L13 23"
          stroke="url(#mpiRefundArrowAmber)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Pulsing Centered Currency Token */}
      <g className="mpi-refund-center-coin">
        <circle cx="16" cy="16" r="5.2" fill="url(#mpiRefundCenterGrad)" stroke="#ffffff" strokeWidth="1.2" />
        <text
          x="16"
          y="18.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="7"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          ₱
        </text>
      </g>
    </svg>
  );
};

export default CustomRefundsIcon;
