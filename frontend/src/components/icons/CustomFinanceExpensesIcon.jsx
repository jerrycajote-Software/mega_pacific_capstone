import React from 'react';
import './customIcons.css';

/**
 * CustomFinanceExpensesIcon
 * Full-color animated SVG icon for Finance Total Expenses KPI card.
 * Features a multi-category segmented financial donut chart,
 * an approved disbursal voucher ticket with serrated edges,
 * and outbound cost-allocation trajectory micro-motion.
 */
const CustomFinanceExpensesIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Total Expenses"
    >
      <defs>
        <linearGradient id="mpiFinExpSlice1" x1="5" y1="5" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>

        <linearGradient id="mpiFinExpSlice2" x1="10" y1="2" x2="22" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>

        <linearGradient id="mpiFinExpSlice3" x1="2" y1="12" x2="14" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        <linearGradient id="mpiFinExpTicketGrad" x1="16" y1="14" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>

        <filter id="mpiFinExpGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#ef4444" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Segmented Category Donut Chart */}
      <g className="mpi-fin-exp-donut" filter="url(#mpiFinExpGlow)">
        {/* Slice 1: Primary Large Cost Segment (Crimson) */}
        <path
          className="mpi-fin-exp-slice-1"
          d="M 13 4 A 9.5 9.5 0 0 1 22.5 13.5 L 18 13.5 A 5 5 0 0 0 13 8.5 Z"
          fill="url(#mpiFinExpSlice1)"
          stroke="#fff1f2"
          strokeWidth="0.6"
        />

        {/* Slice 2: Secondary Operating Overhead (Coral Rose) */}
        <path
          className="mpi-fin-exp-slice-2"
          d="M 22.5 13.5 A 9.5 9.5 0 0 1 15 22.8 L 14 18 A 5 5 0 0 0 18 13.5 Z"
          fill="url(#mpiFinExpSlice2)"
          stroke="#fff1f2"
          strokeWidth="0.6"
        />

        {/* Slice 3: Raw Materials / Freight Logistics (Amber Orange) */}
        <path
          className="mpi-fin-exp-slice-3"
          d="M 15 22.8 A 9.5 9.5 0 0 1 13 4 L 13 8.5 A 5 5 0 0 0 14 18 Z"
          fill="url(#mpiFinExpSlice3)"
          stroke="#fff1f2"
          strokeWidth="0.6"
        />

        {/* Center Cutout Cavity */}
        <circle cx="14" cy="13.5" r="4.2" fill="#4c0519" opacity="0.15" />
      </g>

      {/* Outbound Disbursal Voucher / Expense Ticket */}
      <g className="mpi-fin-exp-ticket">
        {/* Ticket Base with Serrated Left Edge */}
        <path
          d="M 19 14.5 
             L 28.5 14.5 Q 29.5 14.5 29.5 15.5 
             L 29.5 27.5 Q 29.5 28.5 28.5 28.5 
             L 19 28.5
             L 20 27 L 19 25.5 L 20 24 L 19 22.5 L 20 21 L 19 19.5 L 20 18 L 19 16.5 Z"
          fill="url(#mpiFinExpTicketGrad)"
          stroke="#fda4af"
          strokeWidth="0.8"
          filter="drop-shadow(0 2px 4px rgba(225, 29, 72, 0.25))"
        />

        {/* Mini Receipt Line Items */}
        <line x1="22" y1="18" x2="27" y2="18" stroke="#e11d48" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="22" y1="21.5" x2="26" y2="21.5" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="24.5" x2="27.5" y2="24.5" stroke="#fb7185" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1.5 1" />

        {/* Small Outflow Chevron Indicator on Ticket */}
        <circle cx="27" cy="16.5" r="1" fill="#ef4444" />
      </g>
    </svg>
  );
};

export default CustomFinanceExpensesIcon;
