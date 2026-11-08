import React from 'react';
import './customIcons.css';

/**
 * CustomEmptyOrdersSearchIcon
 * Industrial Metal & Steel Hardware theme for "No Orders Found" search & filter empty state.
 * Features an industrial order specification manifest docket with folded corner,
 * stainless steel top clip, blueprint dimensional specification lines,
 * and a precision chrome & brass inspection magnifying glass with crosshair reticle.
 */
const CustomEmptyOrdersSearchIcon = ({ size = 56, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mpi-icon mpi-empty-search-icon ${className}`}
      role="img"
      aria-label="No Orders Found - Order Inspection Search"
      {...props}
    >
      <defs>
        {/* Document Body Brushed Metal Paper Gradient */}
        <linearGradient id="mpiSearchDocGrad" x1="10" y1="4" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Folded Dog-Ear Corner Gradient */}
        <linearGradient id="mpiSearchFoldGrad" x1="26" y1="4" x2="36" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Stainless Steel Clipboard Header Clip */}
        <linearGradient id="mpiSearchClipGrad" x1="14" y1="2" x2="26" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="40%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Magnifying Glass Steel Bezel */}
        <linearGradient id="mpiLensSteelGrad" x1="18" y1="16" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Magnifying Glass 24K Brass Reflector Ring */}
        <linearGradient id="mpiLensBrassGrad" x1="20" y1="18" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Optical Glass Lens Translucent Glow */}
        <radialGradient id="mpiLensGlassGrad" cx="26" cy="24" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.25" />
        </radialGradient>

        {/* Industrial Knurled Handle Grip */}
        <linearGradient id="mpiHandleGrad" x1="33" y1="31" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="30%" stopColor="#334155" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* 3D Drop Shadow */}
        <filter id="mpiSearchDropShadow" x="4" y="2" width="42" height="44" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#mpiSearchDropShadow)">
        {/* Document Sheet Body */}
        <path
          d="M 9 7 C 9 5.34315 10.3431 4 12 4 L 27 4 L 37 14 L 37 41 C 37 42.6569 35.6569 44 34 44 L 12 44 C 10.3431 44 9 42.6569 9 41 Z"
          fill="url(#mpiSearchDocGrad)"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Folded Top-Right Corner */}
        <path
          d="M 27 4 L 27 12 C 27 13.1046 27.8954 14 29 14 L 37 14 Z"
          fill="url(#mpiSearchFoldGrad)"
          stroke="#64748b"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Stainless Steel Clipboard Header Clamp */}
        <rect
          x="14"
          y="2.5"
          width="13"
          height="4.5"
          rx="1.5"
          fill="url(#mpiSearchClipGrad)"
          stroke="#0f172a"
          strokeWidth="0.8"
        />
        {/* Header Clamp Rivet */}
        <circle cx="20.5" cy="4.75" r="0.85" fill="#f8fafc" />

        {/* Specification Lines (Roofing Spec Sheet Manifest) */}
        {/* Order Title Line (Mega Blue) */}
        <line x1="13" y1="12" x2="23" y2="12" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />

        {/* Profile / Gauge Rows */}
        <line x1="13" y1="16.5" x2="24" y2="16.5" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="13" y1="20.5" x2="20" y2="20.5" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="24.5" x2="18" y2="24.5" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="28.5" x2="19" y2="28.5" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="32.5" x2="21" y2="32.5" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="36.5" x2="23" y2="36.5" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="40" x2="26" y2="40" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />

        {/* Precision Inspection Magnifying Glass */}
        {/* Handle - Brass Ferrule Connector */}
        <line
          x1="33"
          y1="31"
          x2="35.5"
          y2="33.5"
          stroke="url(#mpiLensBrassGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Handle - Heavy Industrial Knurled Shaft */}
        <line
          x1="35.5"
          y1="33.5"
          x2="42.5"
          y2="40.5"
          stroke="url(#mpiHandleGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />

        {/* Handle - Gold Brass Knurled Grip Bands */}
        <line x1="37" y1="35" x2="38" y2="36" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <line x1="39.5" y1="37.5" x2="40.5" y2="38.5" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

        {/* Handle - Brass Pommel End Cap */}
        <circle cx="43" cy="41" r="1.6" fill="url(#mpiLensBrassGrad)" stroke="#78350f" strokeWidth="0.5" />

        {/* Magnifying Glass Outer Chrome Bezel */}
        <circle
          cx="27.5"
          cy="25.5"
          r="9.8"
          fill="#0f172a"
          fillOpacity="0.05"
          stroke="url(#mpiLensSteelGrad)"
          strokeWidth="2.2"
        />

        {/* Magnifying Glass Inner Brass Reflective Rim */}
        <circle
          cx="27.5"
          cy="25.5"
          r="8.6"
          fill="none"
          stroke="url(#mpiLensBrassGrad)"
          strokeWidth="0.9"
        />

        {/* Precision Optical Glass Lens Body */}
        <circle
          cx="27.5"
          cy="25.5"
          r="8"
          fill="url(#mpiLensGlassGrad)"
        />

        {/* Optical Glass Lens Gleam Arc */}
        <path
          d="M 22.5 20.5 A 6.8 6.8 0 0 1 31.5 19.5"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Reticle / Measurement Crosshair inside Lens */}
        <line x1="23.5" y1="25.5" x2="31.5" y2="25.5" stroke="#2563eb" strokeWidth="0.9" strokeDasharray="1.2 1.2" opacity="0.8" />
        <line x1="27.5" y1="21.5" x2="27.5" y2="29.5" stroke="#2563eb" strokeWidth="0.9" strokeDasharray="1.2 1.2" opacity="0.8" />

        {/* Precision Center Target Dot (Mega Pacific Emerald) */}
        <circle cx="27.5" cy="25.5" r="1.4" fill="#16a34a" stroke="#ffffff" strokeWidth="0.6" />

        {/* Radiant Optical Flare Sparkle */}
        <path
          d="M 33 16 Q 34 16 34 15 Q 34 16 35 16 Q 34 16 34 17 Q 34 16 33 16 Z"
          fill="#38bdf8"
        />
        <circle cx="34" cy="16" r="0.6" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default CustomEmptyOrdersSearchIcon;

