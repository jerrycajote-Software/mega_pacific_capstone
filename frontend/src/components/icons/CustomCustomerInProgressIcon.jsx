import React from 'react';
import './customIcons.css';

/**
 * CustomCustomerInProgressIcon
 * Full-color animated vector icon for Customer "In Progress" KPI.
 * Features an industrial amber chronometer gauge with progress arc,
 * dynamic rotating clock sweep needle, fabrication gear, and active telemetry radar pulse.
 */
const CustomCustomerInProgressIcon = ({ size = 28, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-cust-inprog-icon ${className}`}
      role="img"
      aria-label="Customer Orders In Progress"
      {...props}
    >
      <defs>
        <linearGradient id="mpiCustProgCaseGrad" x1="8" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiCustProgDialGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mpiCustProgArcGrad" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>

        <linearGradient id="mpiCustProgNeedleGrad" x1="24" y1="13" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <filter id="mpiCustProgGlow" x="4" y="4" width="40" height="40" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Top Chronometer Pushers & Crown */}
      <rect x="22" y="3" width="4" height="4" rx="1" fill="#d97706" />
      <path d="M20 5H28" stroke="#fcd34d" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="33" y="6" width="3" height="3" rx="0.8" transform="rotate(35 33 6)" fill="#b45309" />

      {/* Outer Case Bezel */}
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="url(#mpiCustProgCaseGrad)"
        stroke="#78350f"
        strokeWidth="1.2"
        filter="url(#mpiCustProgGlow)"
      />

      {/* Inner Dial Face */}
      <circle cx="24" cy="24" r="14.5" fill="url(#mpiCustProgDialGrad)" stroke="#334155" strokeWidth="1" />

      {/* Progress Telemetry Arc */}
      <circle
        cx="24"
        cy="24"
        r="12"
        stroke="url(#mpiCustProgArcGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="56 20"
        className="mpi-cust-prog-ring"
      />

      {/* Cardinal Dial Markers */}
      <line x1="24" y1="11" x2="24" y2="13" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="37" y1="24" x2="35" y2="24" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="24" y1="37" x2="24" y2="35" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="24" x2="13" y2="24" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

      {/* Sub-Dial Fabrication Gear Motif */}
      <circle cx="24" cy="24" r="4.5" fill="#1e293b" stroke="#f97316" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.8" />

      {/* Rotating Speed Needle / Hand */}
      <g className="mpi-cust-prog-hand">
        {/* Needle Blade */}
        <polygon points="23,24 24,12 25,24 24,28" fill="url(#mpiCustProgNeedleGrad)" stroke="#b45309" strokeWidth="0.5" />
        {/* Tail Counterweight */}
        <circle cx="24" cy="27" r="1.5" fill="#f59e0b" />
      </g>

      {/* Center Pivot Jewel Cap */}
      <circle cx="24" cy="24" r="2.4" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />

      {/* Live In-Progress Activity Beacon */}
      <circle cx="34" cy="14" r="2.2" fill="#f59e0b" className="mpi-cust-prog-ring" />
      <circle cx="34" cy="14" r="1" fill="#ffffff" />
    </svg>
  );
};

export default CustomCustomerInProgressIcon;
