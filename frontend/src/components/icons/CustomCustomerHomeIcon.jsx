import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerHomeIcon
 * Full-color animated icon for Customer Portal Home / Dashboard.
 * Features an authentic pitched metal roof with corrugated rib seams,
 * warm glowing entryway, chimney smoke micro-motion, and apex star gleam.
 */
const CustomCustomerHomeIcon = ({ size = 22, className = '', isActive = false }) => {
  const activeClass = isActive ? 'mpi-icon-active' : '';

  return (
    <svg
      className={`mpi-icon-base mpi-cust-home-icon ${activeClass} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Home Icon"
    >
      <defs>
        <linearGradient id="mpiCustHomeRoofGrad" x1="4" y1="5" x2="28" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="35%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="mpiCustHomeRidgeGrad" x1="16" y1="4" x2="16" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        <linearGradient id="mpiCustHomeWallGrad" x1="6" y1="14" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        <linearGradient id="mpiCustHomeDoorGrad" x1="13" y1="19" x2="19" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiCustHomeWindowGrad" x1="14" y1="10" x2="18" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="mpiCustHomeSparkGrad" x1="14" y1="2" x2="18" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>

        <filter id="mpiCustHomeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Chimney */}
      <rect x="21" y="7" width="3.2" height="6" rx="0.8" fill="#475569" />
      <rect x="20.4" y="6.2" width="4.4" height="1.4" rx="0.6" fill="#64748b" />
      <circle className="mpi-cust-home-smoke" cx="22.6" cy="4.5" r="1.1" fill="#cbd5e1" opacity="0.75" />

      {/* House Body / Main Wall Structure */}
      <rect x="6.5" y="14" width="19" height="13.5" rx="2" fill="url(#mpiCustHomeWallGrad)" stroke="#94a3b8" strokeWidth="0.8" />

      {/* Concrete Foundation / Garden Base */}
      <rect x="5" y="27" width="22" height="2" rx="1" fill="#15803d" opacity="0.85" />

      {/* Welcoming Arched Front Door */}
      <path
        d="M13 27V21C13 19.3431 14.3431 18 16 18C17.6569 18 19 19.3431 19 21V27H13Z"
        fill="url(#mpiCustHomeDoorGrad)"
      />
      <circle cx="17.8" cy="23.5" r="0.65" fill="#f59e0b" filter="url(#mpiCustHomeGlow)" />

      {/* Warm Ambient Attic Circular Window */}
      <circle cx="16" cy="11.8" r="2.2" fill="url(#mpiCustHomeWindowGrad)" />
      <path d="M16 9.6V14M13.8 11.8H18.2" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />

      {/* Pitched Corrugated Metal Roof with Overhang */}
      <g className="mpi-cust-home-roof">
        <path
          d="M16 4.5L2.8 14.2C2.3 14.6 2.2 15.3 2.6 15.8C3.0 16.3 3.7 16.4 4.2 16L16 7.2L27.8 16C28.3 16.4 29.0 16.3 29.4 15.8C29.8 15.3 29.7 14.6 29.2 14.2L16 4.5Z"
          fill="url(#mpiCustHomeRoofGrad)"
          stroke="#14532d"
          strokeWidth="0.8"
        />

        {/* Roof Ridge Cap */}
        <path
          d="M16 4.2L5.5 12.8L6.8 14.2L16 7.2L25.2 14.2L26.5 12.8L16 4.2Z"
          fill="url(#mpiCustHomeRidgeGrad)"
          opacity="0.85"
        />

        {/* Corrugated Profile Seams */}
        <path d="M11 10.5L9.5 13.5" stroke="#166534" strokeWidth="0.75" strokeLinecap="round" opacity="0.8" />
        <path d="M14 8.2L13.2 12.8" stroke="#166534" strokeWidth="0.75" strokeLinecap="round" opacity="0.8" />
        <path d="M18 8.2L18.8 12.8" stroke="#166534" strokeWidth="0.75" strokeLinecap="round" opacity="0.8" />
        <path d="M21 10.5L22.5 13.5" stroke="#166534" strokeWidth="0.75" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* Roof Apex Gleam Star Sparkle */}
      <path
        className="mpi-cust-home-spark"
        d="M16 1.8L16.6 3.2L18 3.8L16.6 4.4L16 5.8L15.4 4.4L14 3.8L15.4 3.2Z"
        fill="url(#mpiCustHomeSparkGrad)"
        filter="url(#mpiCustHomeGlow)"
      />
    </svg>
  );
};

export default CustomCustomerHomeIcon;

