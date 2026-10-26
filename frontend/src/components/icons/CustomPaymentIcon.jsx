import React from 'react';
import './customIcons.css';

/**
 * CustomPaymentIcon
 * Full-color animated icon for Payments in Finance layout.
 * Features an electric emerald corporate card, radiating contactless NFC waves,
 * and a glittering 24K gold EMV chip.
 */
const CustomPaymentIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Payment Icon"
    >
      <defs>
        <linearGradient id="mpiPayCardGrad" x1="2" y1="9" x2="28" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="mpiPayChipGrad" x1="6" y1="14" x2="11" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Credit Card Base */}
      <rect x="3" y="9" width="24" height="16" rx="3.5" fill="url(#mpiPayCardGrad)" stroke="#ffffff" strokeWidth="0.8" />

      {/* Card Dark Magnetic Trim Stripe */}
      <rect x="3" y="12" width="24" height="3" fill="#064e3b" opacity="0.6" />

      {/* EMV Microchip */}
      <g className="mpi-payment-chip">
        <rect x="6" y="16.5" width="5.5" height="4.5" rx="1" fill="url(#mpiPayChipGrad)" stroke="#b45309" strokeWidth="0.5" />
        <line x1="8.7" y1="16.5" x2="8.7" y2="21" stroke="#b45309" strokeWidth="0.5" />
        <line x1="6" y1="18.7" x2="11.5" y2="18.7" stroke="#b45309" strokeWidth="0.5" />
      </g>

      {/* Masked Card Number Dots */}
      <circle cx="15" cy="18.5" r="0.9" fill="#ffffff" opacity="0.8" />
      <circle cx="17.5" cy="18.5" r="0.9" fill="#ffffff" opacity="0.8" />
      <circle cx="20" cy="18.5" r="0.9" fill="#ffffff" opacity="0.8" />
      <circle cx="22.5" cy="18.5" r="0.9" fill="#ffffff" opacity="0.8" />

      {/* Contactless Radiating NFC Waves */}
      <path
        className="mpi-payment-nfc-1"
        d="M23 4.5C25.5 5.8 27.2 8.2 27.5 11"
        stroke="#22d3ee"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        className="mpi-payment-nfc-2"
        d="M26 2.5C29 4.2 31 7.2 31.5 11"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CustomPaymentIcon;
