import React from 'react';

/**
 * CustomFulfillmentDeliveryIcon
 * Industrial Metal & Steel Hardware theme for Out for Delivery / Fleet Dispatch.
 * Features a heavy-duty commercial freight flatbed truck loaded with
 * strapped corrugated steel roofing sheets, rolling alloy wheels, and speed trails.
 */
const CustomFulfillmentDeliveryIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Out for Delivery - Metal & Steel Hardware"
      {...props}
    >
      <defs>
        {/* Commercial Freight Cab Gradient */}
        <linearGradient id="mpiDelCabGrad" x1="20" y1="12" x2="33" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Heavy Flatbed Frame Gradient */}
        <linearGradient id="mpiDelBedGrad" x1="2" y1="20" x2="21" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Loaded Pre-Painted Corrugated Roofing Sheet Cargo Stack */}
        <linearGradient id="mpiDelSheetsGrad" x1="3" y1="13" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Chrome Alloy Wheels */}
        <radialGradient id="mpiDelWheelGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>

        <filter id="mpiDelShadow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Kinetic Speed Lines */}
      <line x1="1" y1="25" x2="5" y2="25" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="2" y1="21" x2="6" y2="21" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      <g filter="url(#mpiDelShadow)">
        {/* Steel Flatbed Cargo Deck */}
        <rect x="3" y="21" width="18" height="4.5" rx="1" fill="url(#mpiDelBedGrad)" stroke="#334155" strokeWidth="0.8" />

        {/* Loaded Pre-Painted Roofing Sheet Cargo Bundle */}
        <rect
          x="4"
          y="14"
          width="16"
          height="7.5"
          rx="1.2"
          fill="url(#mpiDelSheetsGrad)"
          stroke="#059669"
          strokeWidth="0.8"
        />

        {/* Sheet Profile Corrugation Slat Lines */}
        <line x1="4.5" y1="16.5" x2="19.5" y2="16.5" stroke="#6ee7b7" strokeWidth="1" strokeLinecap="round" />
        <line x1="4.5" y1="19" x2="19.5" y2="19" stroke="#6ee7b7" strokeWidth="1" strokeLinecap="round" />

        {/* Heavy Duty Yellow Ratchet Tie-Down Cargo Straps */}
        <line x1="8" y1="14" x2="8" y2="25" stroke="#facc15" strokeWidth="1.2" />
        <line x1="15" y1="14" x2="15" y2="25" stroke="#facc15" strokeWidth="1.2" />

        {/* Commercial Driver Cabin Body */}
        <path
          d="M20 12H26.5C27.2 12 27.9 12.4 28.3 13L32.2 18C32.7 18.6 33 19.3 33 20.1V25.5H20V12Z"
          fill="url(#mpiDelCabGrad)"
          stroke="#0369a1"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Windshield Glass */}
        <path
          d="M22 14H26L29.5 18.5H22V14Z"
          fill="#dbeafe"
          stroke="#93c5fd"
          strokeWidth="0.6"
        />

        {/* Chrome Front Bumper Grill */}
        <rect x="30" y="22" width="3.5" height="3.5" rx="0.8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
        <circle cx="31.8" cy="23.8" r="0.8" fill="#facc15" />

        {/* Alloy Wheels: Rear Tandem & Front Steering */}
        {/* Rear Wheel */}
        <circle cx="9.5" cy="27" r="3.8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <circle cx="9.5" cy="27" r="2.2" fill="url(#mpiDelWheelGrad)" />
        <circle cx="9.5" cy="27" r="0.9" fill="#0f172a" />

        {/* Front Wheel */}
        <circle cx="26.5" cy="27" r="3.8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <circle cx="26.5" cy="27" r="2.2" fill="url(#mpiDelWheelGrad)" />
        <circle cx="26.5" cy="27" r="0.9" fill="#0f172a" />
      </g>
    </svg>
  );
};

export default CustomFulfillmentDeliveryIcon;
