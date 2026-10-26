import React from 'react';
import './customIcons.css';

/**
 * CustomLogisticStorePickupIcon
 * Full-color animated SVG icon for Logistics Overview "Store Counter Pickups" KPI card.
 * Features a warehouse depot counter storefront with striped awning,
 * customer fulfillment parcel waiting at the counter, and pickup retrieval telemetry radar.
 */
const CustomLogisticStorePickupIcon = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Store Counter Pickups"
    >
      <defs>
        <linearGradient id="mpiLogPickupAwningViolet" x1="0" y1="5" x2="0" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        <linearGradient id="mpiLogPickupAwningWhite" x1="0" y1="5" x2="0" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9d5ff" />
        </linearGradient>

        <linearGradient id="mpiLogPickupCounterGrad" x1="4" y1="21" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#581c87" />
          <stop offset="50%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        <linearGradient id="mpiLogPickupGlassGrad" x1="6" y1="12" x2="26" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>

        <linearGradient id="mpiLogPickupParcelGrad" x1="12" y1="15" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="mpiLogPickupGlow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#8b5cf6" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Warehouse Depot Pickup Structure */}
      <g filter="url(#mpiLogPickupGlow)">
        {/* Depot Front Wall / Glass Window */}
        <rect
          x="6"
          y="11"
          width="20"
          height="11"
          fill="url(#mpiLogPickupGlassGrad)"
          stroke="#4c1d95"
          strokeWidth="0.8"
        />

        {/* Window Reflection Sheen */}
        <polygon
          points="8,13 14,13 10,20 6.5,20"
          fill="#c7d2fe"
          opacity="0.25"
        />

        {/* Counter Shelving / Depot Desk */}
        <rect
          x="4"
          y="21"
          width="24"
          height="3.5"
          rx="1"
          fill="url(#mpiLogPickupCounterGrad)"
          stroke="#4c1d95"
          strokeWidth="0.8"
        />

        {/* Depot Base Legs */}
        <rect x="7" y="24.5" width="2.5" height="4" fill="#3b0764" rx="0.5" />
        <rect x="22.5" y="24.5" width="2.5" height="4" fill="#3b0764" rx="0.5" />

        {/* Striped Storefront Awning Canopy */}
        <g className="mpi-log-pickup-awning">
          {/* Awning Top Bar */}
          <rect x="4" y="5" width="24" height="2" rx="0.8" fill="#6d28d9" />

          {/* Striped Canopy Slats */}
          <path d="M 4 7 L 10 7 L 8.5 13 C 8.5 13 7 14 5.5 14 C 4 14 4 13 4 13 Z" fill="url(#mpiLogPickupAwningViolet)" />
          <path d="M 10 7 L 16 7 L 15 13 C 15 13 13.5 14 12 14 C 10.5 14 10 13 10 13 Z" fill="url(#mpiLogPickupAwningWhite)" />
          <path d="M 16 7 L 22 7 L 21.5 13 C 21.5 13 20 14 18.5 14 C 17 14 16 13 16 13 Z" fill="url(#mpiLogPickupAwningViolet)" />
          <path d="M 22 7 L 28 7 L 28 13 C 28 13 28 14 26.5 14 C 25 14 23.5 14 23 13 Z" fill="url(#mpiLogPickupAwningWhite)" />
        </g>

        {/* Customer Fulfillment Order Package Awaiting Retrieval */}
        <g className="mpi-log-pickup-box">
          <rect
            x="12"
            y="15.5"
            width="8"
            height="6.5"
            rx="1"
            fill="url(#mpiLogPickupParcelGrad)"
            stroke="#b45309"
            strokeWidth="0.6"
          />
          {/* Box Ribbon / Handle */}
          <path
            d="M 14.5 15.5 C 14.5 13.5 17.5 13.5 17.5 15.5"
            stroke="#ea580c"
            strokeWidth="0.9"
            fill="none"
          />
          <line x1="16" y1="15.5" x2="16" y2="22" stroke="#ea580c" strokeWidth="0.8" />
        </g>
      </g>

      {/* Retrieval Location Telemetry Radar Beacon */}
      <g className="mpi-log-pickup-radar">
        <circle cx="26" cy="7" r="3.2" fill="#8b5cf6" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="26" cy="7" r="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomLogisticStorePickupIcon;
