import React from 'react';
import { resolveCustomIconProps } from './CustomIconBase';

export const CustomSearchIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Search" {...rest}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.12" />
      <path d="M15.5 15.5L20.5 20.5" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 8.5C8.5 7.5 9.5 7 11 7" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomCloseIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f43f5e';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Close" {...rest}>
      <circle cx="12" cy="12" r="9" fill={strokeColor} fillOpacity="0.1" />
      <path d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomClearIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Clear" {...rest}>
      <circle cx="12" cy="12" r="9" fill={strokeColor} fillOpacity="0.12" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M9 9L15 15M15 9L9 15" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomCancelIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Cancel" {...rest}>
      <circle cx="12" cy="12" r="9.5" fill={strokeColor} />
      <path d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomCheckIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Check" {...rest}>
      <path d="M4.5 12.5L9.5 17.5L19.5 6.5" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomCheckCircleIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Check Circle" {...rest}>
      <circle cx="12" cy="12" r="9.5" fill={strokeColor} fillOpacity="0.16" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M8 12.2L10.8 15L16 9" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomAddIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#2563eb';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Add" {...rest}>
      <path d="M12 5V19M5 12H19" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

export const CustomAddCircleIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Add Circle" {...rest}>
      <circle cx="12" cy="12" r="9.5" fill={strokeColor} fillOpacity="0.16" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M12 7.5V16.5M7.5 12H16.5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomRemoveCircleIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Remove Circle" {...rest}>
      <circle cx="12" cy="12" r="9.5" fill={strokeColor} fillOpacity="0.16" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M7.5 12H16.5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomRemoveIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Minus" {...rest}>
      <line x1="5" y1="12" x2="19" y2="12" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

export const CustomMinusIcon = CustomRemoveIcon;

export const CustomEditIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Edit" {...rest}>
      <path d="M16.5 3.5C17.3 2.7 18.7 2.7 19.5 3.5C20.3 4.3 20.3 5.7 19.5 6.5L7.5 18.5L3 20L4.5 15.5L16.5 3.5Z" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.15" />
      <path d="M14 6L18 10" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomDeleteIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Delete" {...rest}>
      <path d="M4 6.5H20" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 3H15" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 6.5L7.2 19.2C7.3 20.2 8.2 21 9.2 21H14.8C15.8 21 16.7 20.2 16.8 19.2L18 6.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill={strokeColor} fillOpacity="0.12" />
      <line x1="10" y1="10" x2="10" y2="16.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="16.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

export const CustomSaveIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#2563eb';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Save" {...rest}>
      <path d="M4 4C4 3.4 4.4 3 5 3H16L20 7V20C20 20.6 19.6 21 19 21H5C4.4 21 4 20.6 4 20V4Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.15" />
      <rect x="7" y="3" width="10" height="6" rx="1" fill="#38bdf8" fillOpacity="0.3" stroke={strokeColor} strokeWidth="1.4" />
      <rect x="7" y="13" width="10" height="7" rx="1" fill="#ffffff" fillOpacity="0.8" stroke={strokeColor} strokeWidth="1.4" />
    </svg>
  );
};

export const CustomDownloadIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Download" {...rest}>
      <path d="M12 3V14M12 14L8 10M12 14L16 10" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17V19.5C4 20.3 4.7 21 5.5 21H18.5C19.3 21 20 20.3 20 19.5V17" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomCloudUploadIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Cloud Upload" {...rest}>
      <path d="M7 16C4.8 16 3 14.2 3 12C3 9.9 4.6 8.2 6.7 8C7.3 5.2 9.9 3 13 3C16.6 3 19.6 5.8 19.9 9.4C21.7 10.1 23 11.9 23 14C23 16.8 20.8 19 18 19H7" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill={strokeColor} fillOpacity="0.12" />
      <path d="M12 11V19M12 11L9 14M12 11L15 14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomFilterIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#8b5cf6';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Filter" {...rest}>
      <path d="M3 4.5H21L14 12.5V19.5L10 17V12.5L3 4.5Z" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.18" />
      <line x1="7" y1="8" x2="17" y2="8" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomTuneIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#8b5cf6';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Settings Adjustment" {...rest}>
      <line x1="4" y1="7" x2="20" y2="7" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="7" r="2.8" fill={strokeColor} stroke="#ffffff" strokeWidth="1.2" />
      <line x1="4" y1="17" x2="20" y2="17" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="17" r="2.8" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
};

export const CustomSwapHorizIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Transfer" {...rest}>
      <path d="M19 8L15 4V7H5V9H15V12L19 8Z" fill="#0ea5e9" stroke="#0284c7" strokeWidth="0.8" />
      <path d="M5 16L9 20V17H19V15H9V12L5 16Z" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />
    </svg>
  );
};

export const CustomReplyIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Reply" {...rest}>
      <path d="M10 8L4 13L10 18V14C15 14 18.5 15.8 21 19.5C20 14.5 17 9.5 10 8.5V8Z" fill={strokeColor} fillOpacity="0.18" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomSendIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Send" {...rest}>
      <path d="M22 2L11 13" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomHistoryIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#6366f1';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="History Log" {...rest}>
      <path d="M3.5 12C3.5 7.3 7.3 3.5 12 3.5C16.7 3.5 20.5 7.3 20.5 12C20.5 16.7 16.7 20.5 12 20.5C8.5 20.5 5.5 18.3 4.2 15.2" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M3 8V12.5H7.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7V12L15.5 14" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomLoaderIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={`${className} mpi-rotate-spin`.trim()} style={style} role="img" aria-label="Loading" {...rest}>
      <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="2.4" strokeOpacity="0.2" fill="none" />
      <path d="M12 3C16.97 3 21 7.03 21 12" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const CustomFilterListIcon = CustomFilterIcon;
export const CustomTrashIcon = CustomDeleteIcon;
export const CustomCheckCircleOutlinedIcon = CustomCheckCircleIcon;
export const CustomAddCircleOutlinedIcon = CustomAddCircleIcon;
export const CustomAddCircleOutlineIcon = CustomAddCircleIcon;

export const CustomOpenInFullIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Expand" {...rest}>
      <path d="M15 3h6v6m0-6L14 10M9 21H3v-6m0 6l7-7M3 9V3h6M3 3l7 7m11 11v-6h-6m6 6l-7-7" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomCloseFullscreenIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Compress" {...rest}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

