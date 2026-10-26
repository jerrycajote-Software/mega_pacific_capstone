import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticOutForDeliveryIcon
 * Full-color animated SVG icon for Logistics Overview "Out for Delivery" KPI card.
 * Features an aerodynamic commercial delivery freight truck carrying roofing profiles,
 * velocity wind trails, rolling alloy wheels, and an active in-transit GPS radar pin.
 */
const CustomLogisticOutForDeliveryIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Out for Delivery"
    >
      <defs>
        <linearGradient id="mpiLogTruckBodyGrad" x1="3" y1="10" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiLogTruckCabGrad" x1="19" y1="13" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        <linearGradient id="mpiLogGlassGrad" x1="21" y1="14" x2="27" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>

        <linearGradient id="mpiLogWheelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiLogWindGrad" x1="0" y1="0" x2="6" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
        </linearGradient>

        <filter id="mpiLogTransitGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Dynamic Wind Velocity Dashes */}
      <g className="mpi-log-transit-wind">
        <line x1="1" y1="13" x2="4.5" y2="13" stroke="url(#mpiLogWindGrad)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="16" x2="3.5" y2="16" stroke="url(#mpiLogWindGrad)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="1.5" y1="19" x2="4" y2="19" stroke="url(#mpiLogWindGrad)" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Commercial Freight Transport Truck Body */}
      <g className="mpi-log-transit-truck" filter="url(#mpiLogTransitGlow)">
        {/* Ground Shadow */}
        <ellipse cx="15" cy="24" rx="12" ry="1.2" fill="#0f172a" opacity="0.25" />

        {/* Cargo Box Chassis */}
        <rect
          x="4"
          y="10"
          width="15"
          height="11"
          rx="1.5"
          fill="url(#mpiLogTruckBodyGrad)"
          stroke="#1d4ed8"
          strokeWidth="0.8"
        />

        {/* Roofing Panel Horizontal Grooves on Cargo Box */}
        <line x1="5.5" y1="13" x2="17.5" y2="13" stroke="#93c5fd" strokeWidth="0.6" strokeOpacity="0.6" />
        <line x1="5.5" y1="15.5" x2="17.5" y2="15.5" stroke="#93c5fd" strokeWidth="0.6" strokeOpacity="0.6" />
        <line x1="5.5" y1="18" x2="17.5" y2="18" stroke="#93c5fd" strokeWidth="0.6" strokeOpacity="0.6" />

        {/* Truck Front Driver Cab */}
        <path
          d="M 19 12 L 23.5 12 C 24.5 12 25.5 12.8 26 13.8 L 27.5 17 C 27.8 17.5 28 18 28 18.5 L 28 21 C 28 21.6 27.6 22 27 22 L 19 22 Z"
          fill="url(#mpiLogTruckCabGrad)"
          stroke="#1d4ed8"
          strokeWidth="0.8"
        />

        {/* Driver Cab Windshield */}
        <path
          d="M 20.5 13.2 L 23.5 13.2 C 24.2 13.2 24.8 13.7 25.1 14.4 L 26.2 16.8 C 26.4 17.2 26.1 17.6 25.6 17.6 L 20.5 17.6 Z"
          fill="url(#mpiLogGlassGrad)"
          stroke="#93c5fd"
          strokeWidth="0.5"
        />

        {/* Headlight Beam */}
        <circle cx="27.5" cy="19.5" r="1" fill="#fef08a" />
        <path d="M 28 19 L 31 18 L 31 21 L 28 20 Z" fill="#fef08a" opacity="0.4" />

        {/* Rear Alloy Wheel */}
        <circle cx="8.5" cy="22" r="3.2" fill="url(#mpiLogWheelGrad)" stroke="#64748b" strokeWidth="0.6" />
        <circle cx="8.5" cy="22" r="1.4" fill="#cbd5e1" />
        <circle cx="8.5" cy="22" r="0.6" fill="#1e293b" />

        {/* Front Alloy Wheel */}
        <circle cx="23.5" cy="22" r="3.2" fill="url(#mpiLogWheelGrad)" stroke="#64748b" strokeWidth="0.6" />
        <circle cx="23.5" cy="22" r="1.4" fill="#cbd5e1" />
        <circle cx="23.5" cy="22" r="0.6" fill="#1e293b" />
      </g>

      {/* In-Transit GPS Radar Navigation Pin */}
      <g className="mpi-log-transit-pin">
        <path
          d="M 26 4 C 24.3 4 23 5.3 23 7 C 23 9.2 26 12 26 12 C 26 12 29 9.2 29 7 C 29 5.3 27.7 4 26 4 Z"
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth="0.8"
        />
        <circle cx="26" cy="7" r="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomLogisticOutForDeliveryIcon;
