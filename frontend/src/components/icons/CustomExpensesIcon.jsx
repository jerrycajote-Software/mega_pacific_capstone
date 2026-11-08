import React from 'react';
import './customIcons.css';

/**
 * CustomExpensesIcon
 * Clean, colored custom icon for Expenses in Finance layout.
 * Features an accounting expense voucher receipt with a crimson disbursement arrow.
 */
const CustomExpensesIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Expenses Icon"
    >
      {/* Receipt Slip Body */}
      <path
        d="M5 3.5C5 2.67 5.67 2 6.5 2H17.5C18.33 2 19 2.67 19 3.5V20.5L16.2 19.2L13.5 20.5L10.8 19.2L8 20.5L5 19V3.5Z"
        stroke="#ef4444"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#ef4444"
        fillOpacity="0.16"
      />

      {/* Item Lines */}
      <line
        x1="8"
        y1="6.5"
        x2="16"
        y2="6.5"
        stroke="#f87171"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="9.8"
        x2="13"
        y2="9.8"
        stroke="#f87171"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Downward Expense Disbursement Arrow */}
      <path
        d="M12 13V17.5M12 17.5L9.5 15M12 17.5L14.5 15"
        stroke="#dc2626"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CustomExpensesIcon;
