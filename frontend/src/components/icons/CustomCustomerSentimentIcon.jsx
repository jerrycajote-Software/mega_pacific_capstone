import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerSentimentIcon
 * Full-color animated SVG icon for Customer Sentiment KPI card.
 * Features an executive purple customer service headset, acoustic voice wave arcs,
 * gleaming 24K gold rating star, and active microphone telemetry beacon.
 */
const CustomCustomerSentimentIcon = ({ size = 22, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Customer Sentiment"
    >
      <defs>
        <linearGradient id="mpiSentiHeadsetGrad" x1="6" y1="7" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        <linearGradient id="mpiSentiStarGrad" x1="18" y1="6" x2="26" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <filter id="mpiSentiGlowFilter" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#8b5cf6" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Headset Arc Band */}
      <path
        d="M 8 18 C 7 10, 23 10, 22 18"
        stroke="url(#mpiSentiHeadsetGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#mpiSentiGlowFilter)"
      />

      {/* Left Ear Cushion */}
      <rect
        x="6"
        y="15"
        width="3.5"
        height="7.5"
        rx="1.75"
        fill="#7c3aed"
        stroke="#c084fc"
        strokeWidth="1"
      />

      {/* Right Ear Cushion */}
      <rect
        x="20.5"
        y="15"
        width="3.5"
        height="7.5"
        rx="1.75"
        fill="#7c3aed"
        stroke="#c084fc"
        strokeWidth="1"
      />

      {/* Microphone Boom */}
      <path
        d="M 8 20 C 8 25, 14 26, 14 23.5"
        stroke="#c084fc"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Microphone Tip Beacon */}
      <circle
        className="mpi-senti-beacon"
        cx="14"
        cy="23.5"
        r="1.8"
        fill="#38bdf8"
      />

      {/* Acoustic Voice Wave Arcs */}
      <path
        className="mpi-senti-wave"
        d="M 26 14 C 27.5 16, 27.5 19, 26 21"
        stroke="#c084fc"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="mpi-senti-wave"
        d="M 28.5 12 C 30.5 15, 30.5 20, 28.5 23"
        stroke="#a855f7"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      {/* Customer 5-Star Rating Badge */}
      <g className="mpi-senti-star">
        <polygon
          points="22,6.5 23.5,10 27,10.2 24.2,12.5 25.1,16 22,14.1 18.9,16 19.8,12.5 17,10.2 20.5,10"
          fill="url(#mpiSentiStarGrad)"
          stroke="#eab308"
          strokeWidth="0.8"
        />
        {/* Star Sparkle Ping */}
        <circle cx="22" cy="11.5" r="0.7" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomCustomerSentimentIcon;
