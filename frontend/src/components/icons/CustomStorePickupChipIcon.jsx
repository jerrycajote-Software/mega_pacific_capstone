import React from 'react';

/**
 * CustomStorePickupChipIcon
 * Compact Metal & Steel Hardware icon for Store Pick-up status chips.
 * Features a miniature steel warehouse depot with loading bay and staged package.
 */
const CustomStorePickupChipIcon = ({ size = 15, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Store Pick-up"
      {...props}
    >
      <defs>
        <linearGradient id="mpiChipPickRoof" x1="1" y1="2" x2="15" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      {/* Warehouse Gable Roof */}
      <path d="M1.5 6L8 2L14.5 6H1.5Z" fill="url(#mpiChipPickRoof)" stroke="#7c3aed" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Wall Enclosure */}
      <rect x="2.5" y="6" width="11" height="8" rx="0.8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="0.8" />
      {/* Roll-up Shutter Bay Door */}
      <rect x="4.5" y="7.5" width="7" height="6.5" rx="0.5" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="0.6" />
      {/* Shutter Slats */}
      <line x1="4.5" y1="9.5" x2="11.5" y2="9.5" stroke="#6d28d9" strokeWidth="0.6" />
      <line x1="4.5" y1="11.5" x2="11.5" y2="11.5" stroke="#6d28d9" strokeWidth="0.6" />
      {/* Staged Steel Parcel */}
      <rect x="6" y="11" width="4" height="2.5" rx="0.4" fill="#f59e0b" stroke="#b45309" strokeWidth="0.4" />
    </svg>
  );
};

export default CustomStorePickupChipIcon;

