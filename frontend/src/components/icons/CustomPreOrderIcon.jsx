import React from 'react';
import './customIcons.css';

/**
 * CustomPreOrderIcon
 * Full-color animated icon for Pre-Order Products in Sales layout.
 * Features an advance reservation product package with floating micro-motion,
 * an active ticking countdown clock badge, and a glittering reservation star.
 */
const CustomPreOrderIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pre-Order Products Icon"
    >
      <defs>
        <linearGradient id="mpiPreOrderBoxGrad" x1="4" y1="11" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        <linearGradient id="mpiPreOrderLidGrad" x1="2" y1="7" x2="30" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="mpiPreOrderClockGrad" x1="16" y1="2" x2="28" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="mpiPreOrderRibbonGrad" x1="12" y1="7" x2="18" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      <g className="mpi-preorder-box">
        {/* Main Package Base */}
        <path
          d="M5 12C5 10.8954 5.89543 10 7 10H25C26.1046 10 27 10.8954 27 12V25C27 26.6569 25.6569 28 24 28H8C6.34315 28 5 26.6569 5 25V12Z"
          fill="url(#mpiPreOrderBoxGrad)"
        />

        {/* Center Golden Securing Tape */}
        <rect x="13" y="10" width="4" height="18" fill="url(#mpiPreOrderRibbonGrad)" opacity="0.9" />

        {/* Package Lid */}
        <rect x="4" y="8" width="22" height="4" rx="2" fill="url(#mpiPreOrderLidGrad)" />
      </g>

      {/* Floating Sparkle Star */}
      <path
        className="mpi-preorder-sparkle"
        d="M8 3L9.2 6.2L12 7.2L9.2 8.2L8 11.5L6.8 8.2L4 7.2L6.8 6.2L8 3Z"
        fill="#fef08a"
      />

      {/* Advance Order Clock Badge */}
      <circle cx="22" cy="10" r="7" fill="url(#mpiPreOrderClockGrad)" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="22" cy="10" r="5.5" fill="#0f172a" opacity="0.25" />

      {/* Active Ticking Clock Needle */}
      <g className="mpi-preorder-clock">
        <line x1="22" y1="10" x2="22" y2="5.8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="22" y1="10" x2="24.8" y2="10" stroke="#fef08a" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <circle cx="22" cy="10" r="1.2" fill="#ffffff" />
    </svg>
  );
};

export default CustomPreOrderIcon;
