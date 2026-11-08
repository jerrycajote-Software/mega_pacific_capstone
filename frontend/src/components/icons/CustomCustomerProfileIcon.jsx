import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerProfileIcon
 * Full-color animated icon for Customer Portal Profile / Account.
 * Features a modern customer avatar within a Mega Pacific blue-to-emerald gradient ring,
 * topped with a 24K gold verified customer badge with an emerald checkmark.
 */
const CustomCustomerProfileIcon = ({ size = 22, className = '', isActive = false }) => {
  const activeClass = isActive ? 'mpi-icon-active' : '';

  return (
    <svg
      className={`mpi-icon-base mpi-cust-profile-icon ${activeClass} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Profile Icon"
    >
      <defs>
        <linearGradient id="mpiCustProfRingGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="mpiCustProfBgGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id="mpiCustProfHeadGrad" x1="12" y1="7" x2="20" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mpiCustProfBodyGrad" x1="8" y1="17" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id="mpiCustProfBadgeGrad" x1="19" y1="18" x2="29" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="mpiCustProfCheckGrad" x1="20" y1="20" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <filter id="mpiCustProfGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Gradient Frame Ring */}
      <circle cx="16" cy="16" r="13.5" fill="url(#mpiCustProfBgGrad)" stroke="url(#mpiCustProfRingGrad)" strokeWidth="1.8" />

      {/* Customer Avatar Group */}
      <g className="mpi-cust-prof-avatar">
        {/* Head */}
        <circle cx="16" cy="11.5" r="4.5" fill="url(#mpiCustProfHeadGrad)" stroke="#1e3a8a" strokeWidth="0.6" />
        {/* Hair Highlight Sheen */}
        <path d="M12.5 10C13 8 15 7.2 17.5 7.4C19 7.6 20 8.5 20.2 10" stroke="#93c5fd" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />

        {/* Shoulders / Torso */}
        <path
          d="M8.8 24.5C9.2 19.8 12.2 17.2 16 17.2C19.8 17.2 22.8 19.8 23.2 24.5C23.3 25.4 22.5 26.2 21.6 26.2H10.4C9.5 26.2 8.7 25.4 8.8 24.5Z"
          fill="url(#mpiCustProfBodyGrad)"
          stroke="#1e3a8a"
          strokeWidth="0.7"
        />
        {/* Collar Accent */}
        <path d="M14 17.5L16 20.2L18 17.5" stroke="#bfdbfe" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 24K Gold Verified Customer Badge */}
      <g className="mpi-cust-prof-badge">
        <circle cx="23.5" cy="22.5" r="4.8" fill="url(#mpiCustProfBadgeGrad)" stroke="#ffffff" strokeWidth="1" filter="url(#mpiCustProfGlow)" />
        <circle cx="23.5" cy="22.5" r="3.4" fill="url(#mpiCustProfCheckGrad)" />
        {/* Crisp Checkmark */}
        <path
          d="M21.8 22.5L22.9 23.6L25.3 21.2"
          stroke="#ffffff"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default CustomCustomerProfileIcon;

