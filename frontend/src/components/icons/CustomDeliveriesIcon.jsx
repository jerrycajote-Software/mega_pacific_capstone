import React from 'react';
import './customIcons.css';

/**
 * CustomDeliveriesIcon
 * Full-color animated icon for Deliveries in Logistic layout.
 * Features an industrial freight carrier truck transporting roofing materials,
 * continuous rotating alloy wheels, horizontal aerodynamic speed dashes, and road suspension bounce.
 */
const CustomDeliveriesIcon = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`mpi-icon-base ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Deliveries Icon"
    >
      <defs>
        <linearGradient id="mpiDeliveryCabGrad" x1="16" y1="10" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mpiDeliveryCargoGrad" x1="4" y1="8" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="mpiDeliveryWindshield" x1="21" y1="12" x2="27" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>

        <radialGradient id="mpiDeliveryWheelGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="60%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>

      {/* Aerodynamic Speed Motion Lines Behind Truck */}
      <g className="mpi-delivery-speed-lines">
        <line x1="2" y1="12" x2="6" y2="12" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="1" y1="16" x2="5" y2="16" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="20" x2="6.5" y2="20" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Bouncing Delivery Truck Body */}
      <g className="mpi-delivery-truck">
        {/* Cargo Flatbed & Roofing Goods Payload */}
        <rect x="7" y="10" width="12" height="11" rx="2" fill="url(#mpiDeliveryCargoGrad)" stroke="#78350f" strokeWidth="0.8" />
        
        {/* Metal Cargo Tie-down Bands */}
        <line x1="11" y1="10" x2="11" y2="21" stroke="#fef08a" strokeWidth="1.2" opacity="0.85" />
        <line x1="15" y1="10" x2="15" y2="21" stroke="#fef08a" strokeWidth="1.2" opacity="0.85" />

        {/* Chassis Rail */}
        <rect x="6" y="20.5" width="22" height="3" rx="1.5" fill="#334155" />

        {/* Driver Cab */}
        <path
          d="M19 11H24L28 16V22C28 22.5523 27.5523 23 27 23H19V11Z"
          fill="url(#mpiDeliveryCabGrad)"
          stroke="#1e3a8a"
          strokeWidth="0.8"
        />

        {/* Windshield */}
        <path
          d="M21 13H23.5L26.5 16.5H21V13Z"
          fill="url(#mpiDeliveryWindshield)"
        />

        {/* Headlight */}
        <rect x="27.2" y="18.5" width="1.5" height="2.5" rx="0.75" fill="#fef08a" />
      </g>

      {/* Rear Wheel */}
      <g className="mpi-delivery-wheel" style={{ transformOrigin: '11px 24.5px' }}>
        <circle cx="11" cy="24.5" r="3.5" fill="url(#mpiDeliveryWheelGrad)" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="11" cy="24.5" r="1.2" fill="#ffffff" />
      </g>

      {/* Front Wheel */}
      <g className="mpi-delivery-wheel" style={{ transformOrigin: '24px 24.5px' }}>
        <circle cx="24" cy="24.5" r="3.5" fill="url(#mpiDeliveryWheelGrad)" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="24" cy="24.5" r="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomDeliveriesIcon;
