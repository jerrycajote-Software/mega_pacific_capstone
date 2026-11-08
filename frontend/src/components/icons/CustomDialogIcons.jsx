import React from 'react';
import './customIcons.css';

export const CustomDialogWarningIcon = ({ size = 56, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-dialog-warning-icon ${className}`}
      role="img"
      aria-label="Warning Alert"
      {...props}
    >
      <defs>
        <linearGradient id="mpiWarnSteelBezel" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="mpiWarnAmberCore" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <filter id="mpiWarnShadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#b45309" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#mpiWarnShadow)">
        {/* Outer Triangular Steel Frame */}
        <polygon
          points="24,5 44,40 4,40"
          fill="url(#mpiWarnSteelBezel)"
          stroke="#334155"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Amber Hazard Plate */}
        <polygon
          points="24,9 41,38 7,38"
          fill="url(#mpiWarnAmberCore)"
          stroke="#78350f"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Corner Rivet Screws */}
        <circle cx="24" cy="9.5" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="8.5" cy="37.5" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="39.5" cy="37.5" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />

        {/* Hazard Caution Center Exclamation Mark */}
        <path
          d="M24 17.5V28"
          stroke="#1e293b"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="24" cy="33" r="2" fill="#1e293b" />
        
        {/* Highlight Glint */}
        <path
          d="M24 18V26"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
};

export const CustomDialogSuccessIcon = ({ size = 56, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-dialog-success-icon ${className}`}
      role="img"
      aria-label="Success Alert"
      {...props}
    >
      <defs>
        <linearGradient id="mpiSuccSteelBezel" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="mpiSuccEmeraldCore" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="40%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <filter id="mpiSuccShadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#15803d" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#mpiSuccShadow)">
        {/* Outer Steel Circular Flange */}
        <circle cx="24" cy="24" r="19" fill="url(#mpiSuccSteelBezel)" stroke="#334155" strokeWidth="1.5" />
        
        {/* Inner Emerald Enamel Core */}
        <circle cx="24" cy="24" r="15.5" fill="url(#mpiSuccEmeraldCore)" stroke="#14532d" strokeWidth="0.8" />

        {/* 4 Hex Bolt Rivets */}
        <circle cx="24" cy="7" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="41" cy="24" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="24" cy="41" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="7" cy="24" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />

        {/* Checkmark */}
        <path
          d="M16 24.5L21.5 30L32 18"
          stroke="#ffffff"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 24.5L21.5 30L32 18"
          stroke="#dcfce7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};

export const CustomDialogDangerIcon = ({ size = 56, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-dialog-danger-icon ${className}`}
      role="img"
      aria-label="Danger Alert"
      {...props}
    >
      <defs>
        <linearGradient id="mpiDanSteelBezel" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="mpiDanRedCore" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>

        <filter id="mpiDanShadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#b91c1c" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#mpiDanShadow)">
        {/* Octagonal Steel Rim */}
        <polygon
          points="16,5 32,5 43,16 43,32 32,43 16,43 5,32 5,16"
          fill="url(#mpiDanSteelBezel)"
          stroke="#334155"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Crimson Core */}
        <polygon
          points="16.5,8 31.5,8 40,16.5 40,31.5 31.5,40 16.5,40 8,31.5 8,16.5"
          fill="url(#mpiDanRedCore)"
          stroke="#7f1d1d"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Corner Rivet Screws */}
        <circle cx="16.5" cy="7" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="31.5" cy="7" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="41" cy="16.5" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="41" cy="31.5" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="31.5" cy="41" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="16.5" cy="41" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="7" cy="31.5" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
        <circle cx="7" cy="16.5" r="1.1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />

        {/* Cross Hazard Icon */}
        <path
          d="M17 17L31 31M31 17L17 31"
          stroke="#ffffff"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <path
          d="M17 17L31 31M31 17L17 31"
          stroke="#fee2e2"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};

export const CustomDialogInfoIcon = ({ size = 56, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-dialog-info-icon ${className}`}
      role="img"
      aria-label="Information Alert"
      {...props}
    >
      <defs>
        <linearGradient id="mpiInfoSteelBezel" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="mpiInfoBlueCore" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <filter id="mpiInfoShadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1d4ed8" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#mpiInfoShadow)">
        {/* Outer Circular Steel Bezel */}
        <circle cx="24" cy="24" r="19" fill="url(#mpiInfoSteelBezel)" stroke="#334155" strokeWidth="1.5" />

        {/* Inner Blueprint Blue Core */}
        <circle cx="24" cy="24" r="15.5" fill="url(#mpiInfoBlueCore)" stroke="#1e3a8a" strokeWidth="0.8" />

        {/* 4 Hex Bolt Rivets */}
        <circle cx="24" cy="7" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="41" cy="24" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="24" cy="41" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />
        <circle cx="7" cy="24" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.6" />

        {/* Info Icon */}
        <circle cx="24" cy="16.5" r="2" fill="#ffffff" />
        <path
          d="M24 21.5V31"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M21.5 22.5H24"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

