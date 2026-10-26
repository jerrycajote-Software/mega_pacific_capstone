import React from 'react';
import './customIcons.css';

/**
 * CustomActiveDispatchIcon
 * Full-color animated SVG icon for Active Dispatch KPI card.
 * Features an aerodynamic commercial freight carrier loaded with roofing cargo,
 * rolling alloy wheels, dynamic velocity speed lines, and an active GPS telemetry radar ping.
 */
const CustomActiveDispatchIcon = ({ size = 22, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon-base ${className}`}
      aria-label="Active Dispatch"
    >
      <defs>
        <linearGradient id="mpiDispCabGrad" x1="18" y1="12" x2="29" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="mpiDispCargoGrad" x1="4" y1="13" x2="18" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiDispRoofingGrad" x1="4" y1="9" x2="18" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <filter id="mpiDispGlowFilter" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0ea5e9" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Kinetic Speed Lines Behind Truck */}
      <g className="mpi-disp-speed" opacity="0.8">
        <line x1="2" y1="17" x2="5" y2="17" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="1" y1="20" x2="4" y2="20" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="2" y1="23" x2="5" y2="23" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Dispatch Truck Body & Cargo */}
      <g className="mpi-disp-truck" filter="url(#mpiDispGlowFilter)">
        {/* Loaded Pre-Painted Roofing Sheet Cargo Stack */}
        <rect
          x="5"
          y="11"
          width="13"
          height="3"
          rx="1"
          fill="url(#mpiDispRoofingGrad)"
          stroke="#10b981"
          strokeWidth="0.6"
        />

        {/* Cargo Bed Container */}
        <rect
          x="5"
          y="14"
          width="13"
          height="8"
          rx="1.5"
          fill="url(#mpiDispCargoGrad)"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
        {/* Cargo Panel Grooves */}
        <line x1="9" y1="15" x2="9" y2="21" stroke="#38bdf8" strokeWidth="0.6" opacity="0.7" />
        <line x1="13" y1="15" x2="13" y2="21" stroke="#38bdf8" strokeWidth="0.6" opacity="0.7" />

        {/* Truck Front Driver Cab */}
        <path
          d="M 18 14 H 24 L 27 18 V 22 H 18 V 14 Z"
          fill="url(#mpiDispCabGrad)"
          stroke="#0284c7"
          strokeWidth="0.8"
        />

        {/* Windshield */}
        <path
          d="M 19.5 15.5 H 23.5 L 25.5 18 H 19.5 V 15.5 Z"
          fill="#0c4a6e"
          stroke="#7dd3fc"
          strokeWidth="0.5"
        />

        {/* Headlight */}
        <rect x="26.5" y="19" width="1.5" height="2" rx="0.5" fill="#fef08a" />
      </g>

      {/* Rear Wheel */}
      <g className="mpi-disp-wheel" style={{ transformOrigin: '9.5px 23.5px' }}>
        <circle cx="9.5" cy="23.5" r="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="9.5" cy="23.5" r="1.2" fill="#38bdf8" />
      </g>

      {/* Front Wheel */}
      <g className="mpi-disp-wheel" style={{ transformOrigin: '23.5px 23.5px' }}>
        <circle cx="23.5" cy="23.5" r="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="23.5" cy="23.5" r="1.2" fill="#38bdf8" />
      </g>

      {/* Live GPS Radar Signal Ring Above Cargo */}
      <circle
        className="mpi-disp-gps"
        cx="11.5"
        cy="7.5"
        r="3"
        stroke="#38bdf8"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="2 2"
      />
      <circle cx="11.5" cy="7.5" r="1.2" fill="#0284c7" />
    </svg>
  );
};

export default CustomActiveDispatchIcon;
