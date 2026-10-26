import React from 'react';
import './customIcons.css';

/**
 * CustomExpensesIcon
 * Full-color animated icon for Expenses in Finance layout.
 * Features an accounting expense voucher receipt, a pulsing downward disbursement arrow,
 * and a floating gold transaction currency coin.
 */
const CustomExpensesIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Expenses Icon"
    >
      <defs>
        <linearGradient id="mpiExpenseReceiptGrad" x1="4" y1="3" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id="mpiExpenseArrowGrad" x1="16" y1="12" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>

        <radialGradient id="mpiExpenseCoinGrad" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>

      {/* Accounting Expense Receipt Slip with Sawtooth Base */}
      <path
        d="M5 5C5 3.89543 5.89543 3 7 3H21C22.1046 3 23 3.89543 23 5V25L20 23.5L17 25L14 23.5L11 25L8 23.5L5 25V5Z"
        fill="url(#mpiExpenseReceiptGrad)"
        stroke="#cbd5e1"
        strokeWidth="1"
      />

      {/* Receipt Itemized Lines */}
      <line x1="8" y1="7" x2="15" y2="7" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="11" x2="18" y2="11" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="14.5" x2="16" y2="14.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="18" x2="14" y2="18" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />

      {/* Downward Expense Arrow Badge */}
      <g className="mpi-expense-arrow">
        <circle cx="23" cy="18" r="6" fill="url(#mpiExpenseArrowGrad)" stroke="#ffffff" strokeWidth="1.4" />
        <path d="M23 15V21" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20.5 18.5L23 21L25.5 18.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Floating Currency Coin */}
      <g className="mpi-expense-coin">
        <circle cx="22" cy="26" r="3.8" fill="url(#mpiExpenseCoinGrad)" stroke="#b45309" strokeWidth="0.8" />
        <text x="22" y="28" textAnchor="middle" fill="#78350f" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">₱</text>
      </g>
    </svg>
  );
};

export default CustomExpensesIcon;
