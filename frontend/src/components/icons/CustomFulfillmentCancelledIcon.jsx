import React from 'react';

/**
 * CustomFulfillmentCancelledIcon
 * Industrial Metal & Steel Hardware theme for Order Cancelled / Rejected.
 * Features an industrial steel flange with warning rivets and heavy ruby shield core.
 */
const CustomFulfillmentCancelledIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Order Cancelled - Metal & Steel Hardware"
      {...props}
    >
      <defs>
        <radialGradient id="mpiCancSteelFlange" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>

        <linearGradient id="mpiCancRubyCore" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        <filter id="mpiCancShadow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#dc2626" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#mpiCancShadow)">
        <circle cx="18" cy="18" r="16" fill="url(#mpiCancSteelFlange)" stroke="#e2e8f0" strokeWidth="1.2" />
        <circle cx="18" cy="18" r="12" fill="url(#mpiCancRubyCore)" stroke="#b91c1c" strokeWidth="1" />

        {/* 3D Bold Cross */}
        <line x1="13" y1="13" x2="23" y2="23" stroke="#7f1d1d" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="23" y1="13" x2="13" y2="23" stroke="#7f1d1d" strokeWidth="3.2" strokeLinecap="round" />

        <line x1="13" y1="13" x2="23" y2="23" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="23" y1="13" x2="13" y2="23" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default CustomFulfillmentCancelledIcon;
