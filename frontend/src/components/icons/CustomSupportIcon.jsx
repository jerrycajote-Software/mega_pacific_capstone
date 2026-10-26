import React from 'react';
import './customIcons.css';

/**
 * CustomSupportIcon
 * Full-color animated icon for Support in Sales layout.
 * Features a high-definition customer service headset, pulsing voice sound waves,
 * vibrant sunset coral ear cushions, and an active blinking microphone beacon.
 */
const CustomSupportIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Support Icon"
    >
      <defs>
        <linearGradient id="mpiSupportHeadbandGrad" x1="4" y1="4" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        <linearGradient id="mpiSupportEarGrad" x1="2" y1="13" x2="10" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>

        <linearGradient id="mpiSupportEarRightGrad" x1="22" y1="13" x2="30" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>

        <radialGradient id="mpiSupportMicGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </radialGradient>
      </defs>

      {/* Arched Headband */}
      <path
        d="M6 16C6 10.4772 10.4772 6 16 6C21.5228 6 26 10.4772 26 16"
        stroke="url(#mpiSupportHeadbandGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Left Ear Cushion */}
      <rect x="3" y="13" width="6" height="10" rx="3" fill="url(#mpiSupportEarGrad)" stroke="#ffffff" strokeWidth="0.8" />
      <rect x="5.5" y="15" width="2" height="6" rx="1" fill="#ffffff" opacity="0.4" />

      {/* Right Ear Cushion */}
      <rect x="23" y="13" width="6" height="10" rx="3" fill="url(#mpiSupportEarRightGrad)" stroke="#ffffff" strokeWidth="0.8" />
      <rect x="24.5" y="15" width="2" height="6" rx="1" fill="#ffffff" opacity="0.4" />

      {/* Microphone Boom Arm */}
      <path
        d="M26 18V22C26 24.5 24 26.5 21 26.5H15"
        stroke="#64748b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Active Glowing Microphone Tip */}
      <circle
        className="mpi-support-mic-tip"
        cx="13.5"
        cy="26.5"
        r="2.8"
        fill="url(#mpiSupportMicGrad)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />

      {/* Radiating Sound / Voice Waves */}
      <path
        className="mpi-support-wave-1"
        d="M28 10C29.5 11.5 30.5 13.5 30.5 16"
        stroke="#06b6d4"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        className="mpi-support-wave-2"
        d="M30 7.5C32 9.8 33 12.8 33 16"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CustomSupportIcon;
