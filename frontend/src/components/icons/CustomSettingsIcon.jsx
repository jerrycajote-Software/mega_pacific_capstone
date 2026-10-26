import React from 'react';
import './customIcons.css';

/**
 * CustomSettingsIcon
 * Full-color animated icon for Settings in Admin layout.
 * Features dual interlocking precision gearwheels with synchronized counter-rotations,
 * a glowing central telemetry power core, and smooth acceleration upon hover.
 */
const CustomSettingsIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Settings Icon"
    >
      <defs>
        <linearGradient id="mpiSettingGear1Grad" x1="5" y1="5" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="mpiSettingGear2Grad" x1="17" y1="15" x2="29" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <radialGradient id="mpiSettingCoreGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#06b6d4" />
        </radialGradient>
      </defs>

      {/* Secondary Interlocking Gear (Bottom-Right, Counter-Clockwise Rotation) */}
      <g className="mpi-settings-gear-secondary">
        <path
          d="M23 17V18M23 24V25M27 21H26M20 21H19M25.8 18.2L25.1 18.9M20.9 23.1L20.2 23.8M25.8 23.8L25.1 23.1M20.9 18.9L20.2 18.2"
          stroke="url(#mpiSettingGear2Grad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="23" cy="21" r="3.2" fill="url(#mpiSettingGear2Grad)" />
        <circle cx="23" cy="21" r="1.3" fill="#0f172a" />
      </g>

      {/* Primary Dominant Gear (Top-Left, Clockwise Rotation) */}
      <g className="mpi-settings-gear-primary">
        {/* Gear Teeth Outer Perimeter */}
        <path
          d="M13 5.5V7M13 19V20.5M20.5 13H19M7 13H5.5M18.3 7.7L17.2 8.8M8.8 17.2L7.7 18.3M18.3 18.3L17.2 17.2M8.8 8.8L7.7 7.7"
          stroke="url(#mpiSettingGear1Grad)"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        
        {/* Gear Main Hub Ring */}
        <circle cx="13" cy="13" r="5.6" fill="url(#mpiSettingGear1Grad)" stroke="#ffffff" strokeWidth="0.8" />
        
        {/* Gear Center Hollow Bore */}
        <circle cx="13" cy="13" r="2.8" fill="#0f172a" />
      </g>

      {/* Glowing Central Telemetry Power Core */}
      <circle
        className="mpi-settings-core"
        cx="13"
        cy="13"
        r="1.5"
        fill="url(#mpiSettingCoreGrad)"
      />
    </svg>
  );
};

export default CustomSettingsIcon;
