import React from 'react';
import { resolveCustomIconProps } from './CustomIconBase';

export const CustomChevronRightIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Chevron Right" {...rest}>
      <path d="M9 5L16 12L9 19" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomChevronLeftIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Chevron Left" {...rest}>
      <path d="M15 19L8 12L15 5" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomExpandMoreIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Expand More" {...rest}>
      <path d="M5 9L12 16L19 9" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomArrowBackIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Arrow Back" {...rest}>
      <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomLogoutIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Sign Out" {...rest}>
      <path d="M9 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H9" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 17L21 12L16 7" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M21 12H9" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const CustomLightModeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#fbbf24';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Light Mode" {...rest}>
      <circle cx="12" cy="12" r="4.5" fill={strokeColor} stroke="#f59e0b" strokeWidth="1.2" />
      <line x1="12" y1="2" x2="12" y2="4.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="19.5" x2="12" y2="22" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="4.5" y2="12" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="19.5" y1="12" x2="22" y2="12" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomDarkModeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#6366f1';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Dark Mode" {...rest}>
      <path d="M20.5 13.5C19.3 14.5 17.7 15 16 15C11.6 15 8 11.4 8 7C8 5.3 8.5 3.7 9.5 2.5C5.2 3.7 2 7.5 2 12C2 17.5 6.5 22 12 22C16.5 22 20.3 18.8 21.5 14.5C21.2 14.2 20.8 13.8 20.5 13.5Z" fill={strokeColor} fillOpacity="0.22" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="18.5" cy="5.5" r="1" fill="#fef08a" />
      <circle cx="15.5" cy="2.5" r="0.6" fill="#fef08a" />
    </svg>
  );
};

export const CustomKeyboardArrowDownIcon = CustomExpandMoreIcon;

