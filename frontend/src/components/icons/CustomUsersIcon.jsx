import React from 'react';
import './customIcons.css';

/**
 * CustomUsersIcon
 * Full-color animated icon for Users in Admin layout.
 * Features a multi-user customer community network, buoyant avatar bobbing motion,
 * and interconnected pulsing network telemetry nodes.
 */
const CustomUsersIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Users Icon"
    >
      <defs>
        <linearGradient id="mpiUserMainHeadGrad" x1="11" y1="5" x2="21" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="mpiUserMainBodyGrad" x1="8" y1="17" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>

        <linearGradient id="mpiUserSecHeadGrad" x1="2" y1="8" x2="10" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="mpiUserTertHeadGrad" x1="22" y1="8" x2="30" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Background User Left */}
      <g className="mpi-user-secondary">
        <circle cx="6" cy="11.5" r="3.2" fill="url(#mpiUserSecHeadGrad)" stroke="#ffffff" strokeWidth="0.8" />
        <path
          d="M1.5 24C1.5 19.8 4 17 6.5 17C8.5 17 10 18.2 10.8 20.2"
          stroke="#0284c7"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* Background User Right */}
      <g className="mpi-user-secondary">
        <circle cx="26" cy="11.5" r="3.2" fill="url(#mpiUserTertHeadGrad)" stroke="#ffffff" strokeWidth="0.8" />
        <path
          d="M21.2 20.2C22 18.2 23.5 17 25.5 17C28 17 30.5 19.8 30.5 24"
          stroke="#059669"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* Network Synapse Interconnect Beams */}
      <line x1="8.5" y1="12" x2="13" y2="9.5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.65" />
      <line x1="23.5" y1="12" x2="19" y2="9.5" stroke="#34d399" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.65" />

      {/* Pulsing Interconnect Nodes */}
      <circle className="mpi-user-node" cx="10" cy="10.8" r="1.3" fill="#38bdf8" />
      <circle className="mpi-user-node" cx="22" cy="10.8" r="1.3" fill="#34d399" />

      {/* Forefront Primary User Avatar */}
      <g className="mpi-user-main">
        {/* Head */}
        <circle cx="16" cy="9.5" r="4.8" fill="url(#mpiUserMainHeadGrad)" stroke="#ffffff" strokeWidth="1" />
        
        {/* Torso */}
        <path
          d="M9 25.5C9 20.8 12.1 17.5 16 17.5C19.9 17.5 23 20.8 23 25.5"
          fill="url(#mpiUserMainBodyGrad)"
          stroke="#ffffff"
          strokeWidth="1"
        />
        
        {/* Collar Neck Accent */}
        <path d="M14.5 18L16 20.5L17.5 18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export default CustomUsersIcon;
