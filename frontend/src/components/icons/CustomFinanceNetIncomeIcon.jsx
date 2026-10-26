import React from 'react';
import './customIcons.css';

/**
 * CustomFinanceNetIncomeIcon
 * Full-color animated SVG icon for Finance Net Operating Income KPI card.
 * Features ascending 3D financial EBITDA histogram pillars,
 * soaring profitability sparkline curve with glowing apex beacon,
 * and fiscal yield diamond emblem micro-motion.
 */
const CustomFinanceNetIncomeIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Net Operating Income"
    >
      <defs>
        <linearGradient id="mpiFinNetBar1" x1="4" y1="28" x2="4" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="mpiFinNetBar2" x1="11" y1="28" x2="11" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiFinNetBar3" x1="18" y1="28" x2="18" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        <linearGradient id="mpiFinNetSparkLine" x1="3" y1="22" x2="27" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>

        <linearGradient id="mpiFinNetGem" x1="23" y1="3" x2="29" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <filter id="mpiFinNetGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Grid Floor Line */}
      <line x1="3" y1="28" x2="29" y2="28" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" opacity="0.35" />

      {/* Ascending EBITDA Histogram Pillars */}
      <g filter="url(#mpiFinNetGlow)">
        {/* Pillar 1 */}
        <rect
          className="mpi-fin-net-bar-1"
          x="4"
          y="19"
          width="4.5"
          height="8.5"
          rx="1.5"
          fill="url(#mpiFinNetBar1)"
          stroke="#60a5fa"
          strokeWidth="0.8"
        />

        {/* Pillar 2 */}
        <rect
          className="mpi-fin-net-bar-2"
          x="11"
          y="14"
          width="4.5"
          height="13.5"
          rx="1.5"
          fill="url(#mpiFinNetBar2)"
          stroke="#93c5fd"
          strokeWidth="0.8"
        />

        {/* Pillar 3 */}
        <rect
          className="mpi-fin-net-bar-3"
          x="18"
          y="9"
          width="4.5"
          height="18.5"
          rx="1.5"
          fill="url(#mpiFinNetBar3)"
          stroke="#bfdbfe"
          strokeWidth="0.8"
        />
      </g>

      {/* Soaring Curving Profitability Sparkline */}
      <path
        className="mpi-fin-net-spark"
        d="M 3 23 Q 11 19 17 12 T 26 5.5"
        stroke="url(#mpiFinNetSparkLine)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        filter="drop-shadow(0 0 3px #38bdf8)"
      />

      {/* Radiant Glowing Apex Node */}
      <g className="mpi-fin-net-apex">
        <circle cx="26" cy="5.5" r="3.2" fill="#2563eb" opacity="0.3" />
        <circle cx="26" cy="5.5" r="2" fill="#ffffff" stroke="#38bdf8" strokeWidth="1" />
      </g>

      {/* Profit Margin Diamond Emblem */}
      <g className="mpi-fin-net-gem">
        <polygon
          points="26,1 28.5,3.5 26,6 23.5,3.5"
          fill="url(#mpiFinNetGem)"
          stroke="#ffffff"
          strokeWidth="0.5"
          filter="drop-shadow(0 0 2px #38bdf8)"
        />
      </g>
    </svg>
  );
};

export default CustomFinanceNetIncomeIcon;
