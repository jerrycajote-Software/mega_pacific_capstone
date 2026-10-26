import React from 'react';
import './customIcons.css';

/**
 * CustomAdminUserAccountIcon
 * Represents verified customer profile accounts with emerald gradient badge and avatar.
 * Adheres to SOLID Single Responsibility Principle and strict code styling rules.
 */
const CustomAdminUserAccountIcon = ({ size = 24, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-admin-user-acc-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="mpiAdminUserAccGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="mpiAdminUserAccHead" x1="18" y1="12" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d1fae5" />
        </linearGradient>
        <filter id="mpiAdminUserAccShadow" x="2" y="2" width="44" height="44" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Outer Glow Disc */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="url(#mpiAdminUserAccGrad)"
        fillOpacity="0.16"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        className="mpi-admin-acc-ring"
      />

      {/* Central Solid Disc */}
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="url(#mpiAdminUserAccGrad)"
        filter="url(#mpiAdminUserAccShadow)"
      />

      {/* User Head */}
      <circle
        cx="24"
        cy="19"
        r="5.5"
        fill="url(#mpiAdminUserAccHead)"
        className="mpi-admin-acc-head"
      />

      {/* User Torso / Shoulders */}
      <path
        d="M16.5 33.5C16.5 29.5 19.8 26.5 24 26.5C28.2 26.5 31.5 29.5 31.5 33.5C31.5 34 31 34.5 30.5 34.5H17.5C17 34.5 16.5 34 16.5 33.5Z"
        fill="#ffffff"
        fillOpacity="0.95"
        className="mpi-admin-acc-body"
      />

      {/* Verified Little Badge at lower right */}
      <circle
        cx="34"
        cy="34"
        r="5"
        fill="#047857"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <path
        d="M32 34L33.5 35.5L36.5 32.5"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomAdminUserAccountIcon;
