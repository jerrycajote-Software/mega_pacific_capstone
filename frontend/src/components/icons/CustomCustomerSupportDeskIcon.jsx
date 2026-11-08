import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerSupportDeskIcon
 * Full-color animated icon for the Customer Live Support Desk.
 * Features a modern 3D curved chat bubble with a Mega Pacific emerald/teal gradient,
 * undulating typing activity dots, and an active live status beacon.
 */
const CustomCustomerSupportDeskIcon = ({ size = 20, className = '', isActive = false }) => {
  const activeClass = isActive ? 'mpi-icon-active' : '';

  return (
    <svg
      className={`mpi-icon-base mpi-cust-support-icon ${activeClass} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Live Support Desk Icon"
    >
      <defs>
        <linearGradient id="mpiCustSupportBubbleGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="40%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        <linearGradient id="mpiCustSupportTailGrad" x1="6" y1="20" x2="12" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        <linearGradient id="mpiCustSupportDotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        <radialGradient id="mpiCustSupportBeaconGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>

        <filter id="mpiCustSupportGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Chat Speech Bubble Group */}
      <g className="mpi-cust-support-bubble">
        {/* Tail */}
        <path
          d="M8 22L5.2 27.2C4.9 27.8 5.4 28.5 6.1 28.3L11.5 26.2"
          fill="url(#mpiCustSupportTailGrad)"
          stroke="#0f766e"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Bubble Body */}
        <rect
          x="3.5"
          y="5.5"
          width="25"
          height="19"
          rx="6"
          fill="url(#mpiCustSupportBubbleGrad)"
          stroke="#134e4a"
          strokeWidth="0.8"
        />

        {/* Top Glaze Reflection Sheen */}
        <path
          d="M6 7.5C6 6.4 6.9 5.5 8 5.5H24C25.1 5.5 26 6.4 26 7.5C26 8.5 25.1 9 24 9H8C6.9 9 6 8.5 6 7.5Z"
          fill="#ffffff"
          opacity="0.25"
        />

        {/* Undulating Live Typing Dots */}
        <circle className="mpi-cust-support-dot mpi-cust-support-dot-1" cx="10.5" cy="15" r="2" fill="url(#mpiCustSupportDotGrad)" />
        <circle className="mpi-cust-support-dot mpi-cust-support-dot-2" cx="16" cy="15" r="2" fill="url(#mpiCustSupportDotGrad)" />
        <circle className="mpi-cust-support-dot mpi-cust-support-dot-3" cx="21.5" cy="15" r="2" fill="url(#mpiCustSupportDotGrad)" />
      </g>

      {/* Live Online Pulse Beacon (Top Right of Bubble) */}
      <g className="mpi-cust-support-beacon-group">
        <circle className="mpi-cust-support-beacon-ring" cx="25.5" cy="6.5" r="3.2" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
        <circle className="mpi-cust-support-beacon-dot" cx="25.5" cy="6.5" r="2" fill="url(#mpiCustSupportBeaconGrad)" filter="url(#mpiCustSupportGlow)" />
      </g>
    </svg>
  );
};

export default CustomCustomerSupportDeskIcon;

