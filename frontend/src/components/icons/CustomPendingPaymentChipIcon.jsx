import React from 'react';

/**
 * CustomPendingPaymentChipIcon
 * Compact Metal & Steel Hardware icon for Payment Pending status chips.
 * Features an industrial brass gear chronometer coin with sweep hands.
 */
const CustomPendingPaymentChipIcon = ({ size = 15, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Payment Pending"
      {...props}
    >
      <defs>
        <linearGradient id="mpiChipBrassGrad" x1="2" y1="2" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Brass Outer Bezel */}
      <circle cx="8" cy="8" r="7" fill="url(#mpiChipBrassGrad)" stroke="#d97706" strokeWidth="0.8" />
      {/* Top Chrono Crown */}
      <rect x="7" y="0.5" width="2" height="1.2" rx="0.3" fill="#b45309" />
      {/* Dark Slate Carbon Dial */}
      <circle cx="8" cy="8" r="5.2" fill="#1e293b" />
      {/* Clock Hands */}
      <path d="M8 4.8V8L10.2 9.2" stroke="#facc15" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center Pivot */}
      <circle cx="8" cy="8" r="0.8" fill="#ffffff" />
    </svg>
  );
};

export default CustomPendingPaymentChipIcon;

