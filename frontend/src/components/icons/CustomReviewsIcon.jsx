import React from 'react';
import './customIcons.css';

/**
 * CustomReviewsIcon
 * Clean, colored custom icon for Reviews in Sales layout.
 * Features a royal purple feedback bubble with a warm gold rating evaluation star.
 */
const CustomReviewsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Reviews Icon"
    >
      {/* Feedback Dialogue Bubble */}
      <path
        d="M20 11.5C20 7.36 16.42 4 12 4C7.58 4 4 7.36 4 11.5C4 13.43 4.77 15.19 6.04 16.54L4.8 19.8L8.35 18.78C9.47 19.24 10.7 19.5 12 19.5C16.42 19.5 20 16.14 20 11.5Z"
        stroke="#8b5cf6"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="#8b5cf6"
        fillOpacity="0.18"
      />

      {/* Centered Rating Evaluation Star */}
      <path
        d="M12 7.5L13.2 10.1L16 10.4L13.9 12.3L14.5 15L12 13.6L9.5 15L10.1 12.3L8 10.4L10.8 10.1L12 7.5Z"
        stroke="#d97706"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="#fbbf24"
      />
    </svg>
  );
};

export default CustomReviewsIcon;
