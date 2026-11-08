import React from 'react';
import './customIcons.css';

/**
 * CustomEmptyReviewsIcon
 * Full-color animated icon for empty reviews states in Review Management.
 * Features an industrial customer review speech bubble with rounded contours,
 * a faceted 24K gold dimensional rating star, metallic stylus pen, and radiant sparkles.
 */
const CustomEmptyReviewsIcon = ({ size = 56, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-empty-reviews-icon ${className}`}
      role="img"
      aria-label="No Reviews Found"
      {...props}
    >
      <defs>
        {/* Review Speech Bubble Body Gradient */}
        <linearGradient id="mpiEmptyRevBubbleGrad" x1="10" y1="8" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* 24K Gold Rating Star Gradient */}
        <linearGradient id="mpiEmptyRevStarGrad" x1="22" y1="18" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="85%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Star Shading Facet Gradient */}
        <linearGradient id="mpiEmptyRevStarFacet" x1="32" y1="18" x2="42" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Stylus Pen Barrel Gradient */}
        <linearGradient id="mpiEmptyRevPenGrad" x1="36" y1="20" x2="52" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Pen Metallic Gold Nib Gradient */}
        <linearGradient id="mpiEmptyRevNibGrad" x1="32" y1="36" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Sparkle Glow Filter */}
        <filter id="mpiEmptyRevGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Review Speech Bubble Container */}
      <g className="mpi-empty-review-bubble">
        {/* Soft Ambient Card Drop Shadow */}
        <rect x="9" y="10" width="46" height="36" rx="14" fill="#0f172a" opacity="0.06" />
        
        {/* Speech Bubble Tail */}
        <path
          d="M19 44L14 54C13.5 55 14.8 55.8 15.6 55.1L25.2 46H41C48.7 46 55 39.7 55 32V22C55 14.3 48.7 8 41 8H23C15.3 8 9 14.3 9 22V32C9 38.3 13.2 43.6 19 45.4V44Z"
          fill="url(#mpiEmptyRevBubbleGrad)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Speech Card Top Edge Sheen */}
        <path
          d="M17 11C13.5 11 11.5 13 11 16.5C14 13.5 19 12.5 25 12.5H41C47 12.5 51 15 53 19C52.5 14.5 47.5 11 41 11H17Z"
          fill="#ffffff"
          opacity="0.65"
        />

        {/* Internal Rating Feedback Lines */}
        <rect x="18" y="38" width="16" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.45" />
        <rect x="18" y="42.5" width="10" height="2" rx="1" fill="#cbd5e1" opacity="0.6" />

        {/* Central 24K Gold Rating Star */}
        <g className="mpi-empty-review-star">
          {/* Star Body */}
          <path
            d="M32 17.5L34.9 23.4C35.2 24 35.8 24.4 36.5 24.5L43 25.5C44.8 25.8 45.5 28 44.2 29.3L39.5 33.9C39 34.4 38.8 35.1 38.9 35.7L40 42.2C40.3 44 38.4 45.4 36.8 44.5L31 41.5C30.4 41.2 29.6 41.2 29 41.5L23.2 44.5C21.6 45.4 19.7 44 20 42.2L21.1 35.7C21.2 35.1 21 34.4 20.5 33.9L15.8 29.3C14.5 28 15.2 25.8 17 25.5L23.5 24.5C24.2 24.4 24.8 24 25.1 23.4L28 17.5C28.8 15.9 31.2 15.9 32 17.5Z"
            fill="url(#mpiEmptyRevStarGrad)"
            filter="url(#mpiEmptyRevGlow)"
          />

          {/* Star Dimension Shading Facet (Right Half) */}
          <path
            d="M30 17.8L32 17.5L34.9 23.4C35.2 24 35.8 24.4 36.5 24.5L43 25.5C44.8 25.8 45.5 28 44.2 29.3L39.5 33.9C39 34.4 38.8 35.1 38.9 35.7L40 42.2C40.3 44 38.4 45.4 36.8 44.5L30 41L30 17.8Z"
            fill="url(#mpiEmptyRevStarFacet)"
            opacity="0.35"
          />

          {/* Core Star Specular Gleam Highlight */}
          <circle cx="28" cy="24" r="1.8" fill="#ffffff" opacity="0.75" />
        </g>

        {/* Flanking Small Stars */}
        <path
          d="M17 20L17.8 22L20 22.3L18.4 23.8L18.8 26L17 25L15.2 26L15.6 23.8L14 22.3L16.2 22L17 20Z"
          fill="#fbbf24"
          opacity="0.85"
        />
        <path
          d="M45 36L45.8 38L48 38.3L46.4 39.8L46.8 42L45 41L43.2 42L43.6 39.8L42 38.3L44.2 38L45 36Z"
          fill="#fbbf24"
          opacity="0.85"
        />

        {/* Angled Review Drafting Pen / Stylus */}
        <g className="mpi-empty-review-pen">
          {/* Pen Barrel */}
          <rect
            x="41"
            y="12"
            width="5.5"
            height="18"
            rx="2"
            transform="rotate(45 41 12)"
            fill="url(#mpiEmptyRevPenGrad)"
            stroke="#1e3a8a"
            strokeWidth="0.8"
          />
          {/* Pen Gold Grip Band */}
          <rect
            x="33.5"
            y="23.5"
            width="5.5"
            height="3.2"
            rx="0.5"
            transform="rotate(45 33.5 23.5)"
            fill="url(#mpiEmptyRevNibGrad)"
          />
          {/* Pen Precision Nib */}
          <path
            d="M26.5 37.5L29.5 34.5L31.5 36.5L25 39L26.5 37.5Z"
            fill="url(#mpiEmptyRevNibGrad)"
            stroke="#92400e"
            strokeWidth="0.6"
          />
          <circle cx="25" cy="39" r="0.6" fill="#1e3a8a" />
        </g>

        {/* Twinkling Ambient Sparkles */}
        <path
          className="mpi-empty-review-sparkle-1"
          d="M48 6L48.8 7.8L50.5 8.5L48.8 9.2L48 11L47.2 9.2L45.5 8.5L47.2 7.8L48 6Z"
          fill="#fef08a"
          filter="url(#mpiEmptyRevGlow)"
        />
        <path
          className="mpi-empty-review-sparkle-2"
          d="M8 28L8.6 29.4L10 30L8.6 30.6L8 32L7.4 30.6L6 30L7.4 29.4L8 28Z"
          fill="#fbbf24"
          filter="url(#mpiEmptyRevGlow)"
        />
      </g>
    </svg>
  );
};

export default CustomEmptyReviewsIcon;

