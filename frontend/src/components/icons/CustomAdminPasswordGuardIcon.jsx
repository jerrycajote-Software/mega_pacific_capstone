import React from 'react';
import './customIcons.css';

/**
 * CustomAdminPasswordGuardIcon
 * Full-color animated SVG icon for Settings "Password Complexity & Reset Guard" card.
 * Features an enchanted golden cryptographic key with padlock shield and radiant security spark.
 */
const CustomAdminPasswordGuardIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Password Guard"
    >
      <defs>
        <linearGradient id="mpiAdmPwdPadlockGrad" x1="6" y1="12" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiAdmPwdKeyGrad" x1="10" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiAdmPwdGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Fortified Padlock Base Body in Background */}
      <g filter="url(#mpiAdmPwdGlow)">
        {/* Shackle */}
        <path
          d="M 11 14 L 11 9 C 11 6.2 13.2 4 16 4 C 18.8 4 21 6.2 21 9 L 21 14"
          stroke="#93c5fd"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Padlock Body */}
        <rect
          x="7"
          y="13"
          width="18"
          height="14"
          rx="3"
          fill="url(#mpiAdmPwdPadlockGrad)"
          stroke="#60a5fa"
          strokeWidth="1"
        />
        {/* Keyhole */}
        <circle cx="16" cy="18" r="2" fill="#0f172a" />
        <polygon points="15.2,18 16.8,18 17.5,23 14.5,23" fill="#0f172a" />
      </g>

      {/* Cryptographic Golden Precision Key */}
      <g className="mpi-adm-pwd-key">
        {/* Key Bow Head */}
        <circle
          cx="21"
          cy="11"
          r="4.5"
          fill="url(#mpiAdmPwdKeyGrad)"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <circle cx="21" cy="11" r="2" fill="#1e3a8a" />

        {/* Key Shaft / Barrel */}
        <path
          d="M 17.5 13.5 L 9 22"
          stroke="url(#mpiAdmPwdKeyGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Key Bits / Teeth */}
        <path
          d="M 11 20 L 12.5 21.5 M 9.5 21.5 L 11 23"
          stroke="#d97706"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Security Cipher Sparkle */}
      <g className="mpi-adm-pwd-spark">
        <path
          d="M 26 3 L 27 5.5 L 29.5 6.5 L 27 7.5 L 26 10 L 25 7.5 L 22.5 6.5 L 25 5.5 Z"
          fill="#fef08a"
          stroke="#fbbf24"
          strokeWidth="0.4"
        />
      </g>
    </svg>
  );
};

export default CustomAdminPasswordGuardIcon;
