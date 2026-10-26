import React from 'react';
import './customIcons.css';

/**
 * CustomRefundDisbursedTodayIcon
 * Full-color animated SVG icon for Refund Management "Disbursed Today" KPI card.
 * Features an executive sapphire financial wallet, emerging disbursement banknote,
 * metallic golden clasp, and live fiscal disbursement telemetry spark.
 */
const CustomRefundDisbursedTodayIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Disbursed Today"
    >
      <defs>
        <linearGradient id="mpiRefDisbWalletGrad" x1="4" y1="10" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="mpiRefDisbFlapGrad" x1="4" y1="10" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiRefDisbBillGrad" x1="8" y1="4" x2="24" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <linearGradient id="mpiRefDisbClaspGrad" x1="21" y1="16" x2="27" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiRefDisbGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Emerging Disbursement Banknote in Background */}
      <g className="mpi-ref-disb-bill">
        <rect
          x="8"
          y="4.5"
          width="16"
          height="9"
          rx="1.5"
          fill="url(#mpiRefDisbBillGrad)"
          stroke="#6ee7b7"
          strokeWidth="0.8"
        />
        <circle cx="16" cy="9" r="2.2" fill="#047857" stroke="#a7f3d0" strokeWidth="0.5" />
        <circle cx="16" cy="9" r="1" fill="#ecfdf5" />
      </g>

      {/* Main Sapphire Wallet Body */}
      <g filter="url(#mpiRefDisbGlow)">
        {/* Rear Wallet Layer */}
        <rect
          x="4.5"
          y="9.5"
          width="23"
          height="17"
          rx="3"
          fill="url(#mpiRefDisbWalletGrad)"
          stroke="#60a5fa"
          strokeWidth="1.2"
        />

        {/* Front Curved Flap Pocket */}
        <path
          d="M 4.5 14.5 C 4.5 14.5 12 18 19 18 C 24 18 27.5 15.5 27.5 15.5 L 27.5 23.5 C 27.5 25.2 26.2 26.5 24.5 26.5 H 7.5 C 5.8 26.5 4.5 25.2 4.5 23.5 Z"
          fill="url(#mpiRefDisbFlapGrad)"
          stroke="#93c5fd"
          strokeWidth="0.8"
        />

        {/* Embossed Stitching Line */}
        <path
          d="M 6.5 24.5 H 25.5"
          stroke="#93c5fd"
          strokeWidth="0.7"
          strokeDasharray="2 1"
          opacity="0.75"
        />

        {/* Golden Metallic Clasp Badge */}
        <g className="mpi-ref-disb-clasp">
          <rect
            x="20.5"
            y="17"
            width="6.5"
            height="4.5"
            rx="1.5"
            fill="url(#mpiRefDisbClaspGrad)"
            stroke="#fffbeb"
            strokeWidth="0.6"
            filter="drop-shadow(0 1px 2px rgba(180, 83, 9, 0.4))"
          />
          <circle cx="23.75" cy="19.25" r="0.9" fill="#78350f" />
        </g>
      </g>

      {/* Live Disbursal Sparkle */}
      <g className="mpi-ref-disb-spark">
        <path
          d="M 27 5 L 28 2.5 L 29 5 L 31.5 6 L 29 7 L 28 9.5 L 27 7 L 24.5 6 Z"
          fill="#38bdf8"
          filter="drop-shadow(0 0 2px #38bdf8)"
        />
      </g>
    </svg>
  );
};

export default CustomRefundDisbursedTodayIcon;
