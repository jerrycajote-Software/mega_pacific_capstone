import React from 'react';
import './customIcons.css';

/**
 * CustomReviewsIcon
 * Full-color animated icon for Reviews in Sales layout.
 * Features a modern feedback dialogue bubble, a twinkling dimensional gold rating star,
 * and ambient glittering evaluation sparkles.
 */
const CustomReviewsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Reviews Icon"
    >
      <defs>
        <linearGradient id="mpiReviewBubbleGrad" x1="3" y1="4" x2="29" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="mpiReviewStarGrad" x1="16" y1="8" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <filter id="mpiReviewGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Feedback Speech Bubble */}
      <path
        className="mpi-review-bubble"
        d="M4 14C4 8.47715 8.47715 4 14 4H18C23.5228 4 28 8.47715 28 14C28 19.5228 23.5228 24 18 24H12L6 28V22.5C4.74391 20.1256 4 17.1856 4 14Z"
        fill="url(#mpiReviewBubbleGrad)"
      />

      {/* Decorative Dialogue Notch Highlight */}
      <path
        d="M8 8C10.5 5.5 15 5 18 5"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Dimensional Twinkling 5-Star Rating */}
      <path
        className="mpi-review-star"
        d="M16 8.5L18.2 12.8L23 13.5L19.5 16.8L20.3 21.5L16 19.2L11.7 21.5L12.5 16.8L9 13.5L13.8 12.8L16 8.5Z"
        fill="url(#mpiReviewStarGrad)"
        stroke="#ffffff"
        strokeWidth="0.8"
        filter="url(#mpiReviewGlow)"
      />

      {/* Ambient Sparkling Accent Stars */}
      <circle cx="26" cy="6" r="1.5" fill="#fef08a" opacity="0.85" />
      <circle cx="23.5" cy="3.5" r="0.8" fill="#ffffff" opacity="0.9" />
      <circle cx="6.5" cy="19.5" r="1.2" fill="#fef08a" opacity="0.75" />
    </svg>
  );
};

export default CustomReviewsIcon;
