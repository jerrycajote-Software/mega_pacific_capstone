import React from 'react';
import './customIcons.css';

/**
 * CustomFinanceRevenueIcon
 * Full-color animated SVG icon for Finance Total Revenue KPI card.
 * Features an angled security banknote with guilloche watermark,
 * 3D cylindrical coin stack with embossed Philippine Peso (₱) symbol,
 * and upward fiscal velocity micro-motion.
 */
const CustomFinanceRevenueIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Total Revenue"
    >
      <defs>
        <linearGradient id="mpiFinRevBillGrad" x1="3" y1="5" x2="25" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="mpiFinRevBillBorder" x1="3" y1="5" x2="25" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>

        <linearGradient id="mpiFinRevCoinTop" x1="18" y1="17" x2="29" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="mpiFinRevCoinEdge" x1="18" y1="21" x2="29" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="mpiFinRevSparkGrad" x1="26" y1="4" x2="31" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <filter id="mpiFinRevGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Floating Banknote */}
      <g className="mpi-fin-rev-bill" filter="url(#mpiFinRevGlow)">
        <rect
          x="3.5"
          y="6.5"
          width="21"
          height="12"
          rx="2.5"
          fill="url(#mpiFinRevBillGrad)"
          stroke="url(#mpiFinRevBillBorder)"
          strokeWidth="1.2"
        />
        {/* Inner Guilloche Border */}
        <rect
          x="5.5"
          y="8.5"
          width="17"
          height="8"
          rx="1.5"
          stroke="#34d399"
          strokeWidth="0.7"
          strokeDasharray="2 1"
          opacity="0.75"
        />
        {/* Central Currency Emblem Circle */}
        <circle cx="14" cy="12.5" r="2.8" fill="#047857" stroke="#6ee7b7" strokeWidth="0.8" />
        <circle cx="14" cy="12.5" r="1.3" fill="#a7f3d0" />
        {/* Side Corner Security Dots */}
        <circle cx="6.5" cy="9.5" r="0.6" fill="#6ee7b7" />
        <circle cx="21.5" cy="9.5" r="0.6" fill="#6ee7b7" />
        <circle cx="6.5" cy="15.5" r="0.6" fill="#6ee7b7" />
        <circle cx="21.5" cy="15.5" r="0.6" fill="#6ee7b7" />
      </g>

      {/* 3D Tiered Golden Peso Coin Stack */}
      <g className="mpi-fin-rev-coins">
        {/* Base Coin 1 */}
        <g opacity="0.95">
          <path d="M 18 25 C 18 23.6 20.46 22.5 23.5 22.5 C 26.54 22.5 29 23.6 29 25 L 29 27.5 C 29 28.9 26.54 30 23.5 30 C 20.46 30 18 28.9 18 27.5 Z" fill="url(#mpiFinRevCoinEdge)" />
          <ellipse cx="23.5" cy="25" rx="5.5" ry="2.2" fill="#f59e0b" stroke="#fef08a" strokeWidth="0.6" />
        </g>

        {/* Middle Coin 2 */}
        <g opacity="0.98">
          <path d="M 18 21.5 C 18 20.1 20.46 19 23.5 19 C 26.54 19 29 20.1 29 21.5 L 29 24 C 29 25.4 26.54 26.5 23.5 26.5 C 20.46 26.5 18 25.4 18 24 Z" fill="url(#mpiFinRevCoinEdge)" />
          <ellipse cx="23.5" cy="21.5" rx="5.5" ry="2.2" fill="#fbbf24" stroke="#fef08a" strokeWidth="0.6" />
        </g>

        {/* Top Coin 3 with Embossed Peso ₱ */}
        <g className="mpi-fin-rev-coin-top">
          <path d="M 18 18 C 18 16.6 20.46 15.5 23.5 15.5 C 26.54 15.5 29 16.6 29 18 L 29 20.5 C 29 21.9 26.54 23 23.5 23 C 20.46 23 18 21.9 18 20.5 Z" fill="url(#mpiFinRevCoinEdge)" />
          <ellipse cx="23.5" cy="18" rx="5.5" ry="2.2" fill="url(#mpiFinRevCoinTop)" stroke="#fffbeb" strokeWidth="0.8" />
          <ellipse cx="23.5" cy="18" rx="4.3" ry="1.6" fill="none" stroke="#d97706" strokeWidth="0.5" opacity="0.6" />
          {/* Peso ₱ Symbol on Top Coin */}
          <text
            x="23.5"
            y="19.2"
            textAnchor="middle"
            fontSize="3.8"
            fontWeight="900"
            fill="#78350f"
            fontFamily="Arial, sans-serif"
          >
            ₱
          </text>
        </g>
      </g>

      {/* Upward Velocity Sparkle */}
      <g className="mpi-fin-rev-sparkle">
        <path
          d="M 28 5 L 29 2 L 30 5 L 33 6 L 30 7 L 29 10 L 28 7 L 25 6 Z"
          fill="url(#mpiFinRevSparkGrad)"
          filter="drop-shadow(0 0 2px #34d399)"
        />
        <circle cx="29" cy="6" r="0.8" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomFinanceRevenueIcon;
