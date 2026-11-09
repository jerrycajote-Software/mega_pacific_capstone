import React from 'react';
import { resolveCustomIconProps } from './CustomIconBase';

export const CustomMailIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Mail" {...rest}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" />
      <path d="M3 7L12 13L21 7" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17.5" cy="8.5" r="1" fill="#ef4444" />
    </svg>
  );
};

export const CustomPhoneIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Phone" {...rest}>
      <path d="M5 4H9L11 8.5L8.5 10.5C9.7 12.9 11.6 14.8 14 16L16 13.5L20.5 15.5V19.5C20.5 20.3 19.8 21 19 21C10.7 21 4 14.3 4 6C4 5.2 4.7 4.5 5.5 4.5H5Z" fill={strokeColor} fillOpacity="0.16" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomLocationOnIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Location" {...rest}>
      <path d="M12 2C8.1 2 5 5.1 5 9C5 14.2 12 22 12 22C12 22 19 14.2 19 9C19 5.1 15.9 2 12 2Z" fill={strokeColor} fillOpacity="0.18" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.8" fill={strokeColor} stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
};

export const CustomLockIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Security Lock" {...rest}>
      <rect x="5" y="10" width="14" height="11" rx="2" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" />
      <path d="M8 10V6.5C8 4.6 9.6 3 11.5 3H12.5C14.4 3 16 4.6 16 6.5V10" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill={strokeColor} />
      <path d="M12 16.5V18" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const CustomLockResetIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Lock Reset" {...rest}>
      <rect x="6" y="11" width="12" height="9" rx="2" fill={strokeColor} fillOpacity="0.18" stroke={strokeColor} strokeWidth="1.6" />
      <path d="M9 11V8C9 6.3 10.3 5 12 5C13.7 5 15 6.3 15 8V11" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.5 7A7 7 0 1 0 19 12" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M19 4V7.5H15.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomKeyIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Access Key" {...rest}>
      <circle cx="8" cy="12" r="5" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.2" />
      <circle cx="8" cy="12" r="2" fill={strokeColor} />
      <path d="M13 12H21V15H19V12H17V15H15V12" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomShieldIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Shield Security" {...rest}>
      <path d="M12 2L4 5.5V11.5C4 16.5 7.4 21.2 12 22C16.6 21.2 20 16.5 20 11.5V5.5L12 2Z" fill={strokeColor} fillOpacity="0.18" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11.5L11 13.5L15 9.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomAdminPanelSettingsIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Admin Security Settings" {...rest}>
      <path d="M12 2L3 6V11.5C3 16.8 6.8 21.7 12 22.5C17.2 21.7 21 16.8 21 11.5V6L12 2Z" fill={strokeColor} fillOpacity="0.15" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="11.5" r="3.2" stroke="#f59e0b" strokeWidth="1.8" fill="#f59e0b" fillOpacity="0.25" />
      <path d="M12 6.5V8M12 15V16.5M7 11.5H8.5M15.5 11.5H17" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomVisibilityIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Show" {...rest}>
      <path d="M2 12C3.8 6.5 7.6 3.5 12 3.5C16.4 3.5 20.2 6.5 22 12C20.2 17.5 16.4 20.5 12 20.5C7.6 20.5 3.8 17.5 2 12Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" />
      <circle cx="12" cy="12" r="3.5" stroke="#38bdf8" strokeWidth="1.8" fill={strokeColor} />
      <circle cx="13" cy="11" r="1.2" fill="#ffffff" />
    </svg>
  );
};

export const CustomVisibilityOffIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Hide" {...rest}>
      <path d="M3 3L21 21" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 10.7C10.2 11.1 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 12.9 13.8 13.3 13.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.6 6.8C4.5 8.2 3 10 2 12C3.8 17.5 7.6 20.5 12 20.5C14.2 20.5 16.2 19.7 17.8 18.4" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M9.8 4.2C10.5 4 11.2 3.9 12 3.9C16.4 3.9 20.2 6.9 22 12.4C21.3 14.5 20 16.3 18.4 17.7" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const CustomErrorOutlineIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Error Alert" {...rest}>
      <circle cx="12" cy="12" r="9.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.14" />
      <line x1="12" y1="7.5" x2="12" y2="12.5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.2" fill={strokeColor} />
    </svg>
  );
};

export const CustomWarningIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Warning" {...rest}>
      <path d="M12 3.5L22 20.5H2L12 3.5Z" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="14" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill={strokeColor} />
    </svg>
  );
};

export const CustomWarningAmberIcon = CustomWarningIcon;

export const CustomAccessTimeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Time" {...rest}>
      <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.14" />
      <path d="M12 7V12L15.5 14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomHourglassEmptyIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Hourglass" {...rest}>
      <path d="M6 3H18M6 21H18M7 3V7.5L11 12L7 16.5V21M17 3V7.5L13 12L17 16.5V21" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.15" />
    </svg>
  );
};

export const CustomCalendarTodayIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Calendar" {...rest}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={strokeColor} strokeWidth="1.8" fill="#ffffff" fillOpacity="0.9" />
      <path d="M3 9.5H21" stroke="#ef4444" strokeWidth="2" />
      <line x1="8" y1="2.5" x2="8" y2="5.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="2.5" x2="16" y2="5.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.2" fill={strokeColor} />
      <circle cx="12" cy="14" r="1.2" fill={strokeColor} />
      <circle cx="16" cy="14" r="1.2" fill={strokeColor} />
    </svg>
  );
};

export const CustomLocalShippingIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Shipping Logistics" {...rest}>
      <rect x="2" y="7" width="12" height="9" rx="1.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.2" />
      <path d="M14 9.5H18L21 13V16H14V9.5Z" stroke="#0369a1" strokeWidth="1.8" strokeLinejoin="round" fill="#38bdf8" fillOpacity="0.25" />
      <circle cx="6.5" cy="17.5" r="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
      <circle cx="17.5" cy="17.5" r="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
    </svg>
  );
};

export const CustomStorefrontIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Store Pickup" {...rest}>
      <path d="M3 9L4.5 4H19.5L21 9V10C21 11.1 20.1 12 19 12C17.9 12 17 11.1 17 10C17 11.1 16.1 12 15 12C13.9 12 13 11.1 13 10C13 11.1 12.1 12 11 12C9.9 12 9 11.1 9 10C9 11.1 8.1 12 7 12C5.9 12 5 11.1 5 10V9H3Z" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="4.5" y="12" width="15" height="9" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.14" />
      <rect x="9.5" y="15" width="5" height="6" fill="#0284c7" fillOpacity="0.3" stroke={strokeColor} strokeWidth="1.2" />
    </svg>
  );
};

export const CustomWarehouseIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#475569';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Warehouse" {...rest}>
      <path d="M3 20V9L12 4L21 9V20H3Z" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.15" />
      <rect x="8" y="12" width="8" height="8" stroke="#0ea5e9" strokeWidth="1.6" fill="#38bdf8" fillOpacity="0.25" />
      <line x1="8" y1="15" x2="16" y2="15" stroke="#0ea5e9" strokeWidth="1.2" />
      <line x1="8" y1="17.5" x2="16" y2="17.5" stroke="#0ea5e9" strokeWidth="1.2" />
    </svg>
  );
};

export const CustomFactoryIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0f766e';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Manufacturing Plant" {...rest}>
      <path d="M2 20V12L7 15V12L12 15V10L17 13V4H22V20H2Z" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.18" />
      <rect x="5" y="16.5" width="3" height="3.5" fill="#f59e0b" fillOpacity="0.4" />
      <rect x="14" y="16.5" width="3" height="3.5" fill="#f59e0b" fillOpacity="0.4" />
    </svg>
  );
};

export const CustomInventory2Icon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#d97706';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Inventory Parcel" {...rest}>
      <path d="M3 5C3 4.4 3.4 4 4 4H20C20.6 4 21 4.4 21 5V8H3V5Z" fill="#0284c7" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1.8" />
      <path d="M4 8V19C4 19.6 4.4 20 5 20H19C19.6 20 20 19.6 20 19V8" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.15" />
      <rect x="9.5" y="11" width="5" height="3" rx="0.8" fill="#f59e0b" stroke={strokeColor} strokeWidth="1.2" />
    </svg>
  );
};

export const CustomInventoryIcon = CustomInventory2Icon;
export const CustomInventory2OutlinedIcon = CustomInventory2Icon;

export const CustomPaletteIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#8b5cf6';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Palette Color" {...rest}>
      <path d="M12 3C7 3 3 7 3 12C3 16.5 6.5 20 11 20C12.1 20 13 19.1 13 18C13 17.5 12.8 17 12.4 16.6C12 16.2 11.8 15.6 11.8 15C11.8 13.9 12.7 13 13.8 13H15.5C18.5 13 21 10.5 21 7.5C21 5 17 3 12 3Z" fill={strokeColor} fillOpacity="0.16" stroke={strokeColor} strokeWidth="1.8" />
      <circle cx="7.5" cy="9.5" r="1.5" fill="#ef4444" />
      <circle cx="10.5" cy="6.5" r="1.5" fill="#f59e0b" />
      <circle cx="14.5" cy="6.5" r="1.5" fill="#10b981" />
      <circle cx="17.5" cy="9.5" r="1.5" fill="#0ea5e9" />
    </svg>
  );
};

export const CustomStraightenIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#eab308';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Ruler Dimension" {...rest}>
      <rect x="2" y="7" width="20" height="10" rx="1.5" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" />
      <line x1="6" y1="7" x2="6" y2="12" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="7" x2="10" y2="10" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="7" x2="14" y2="12" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18" y1="7" x2="18" y2="10" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
};

export const CustomLayersIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Layers" {...rest}>
      <polygon points="12,2 2,7 12,12 22,7" fill="#38bdf8" fillOpacity="0.25" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M2 12L12 17L22 12" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 17L12 22L22 17" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomNotesIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Notes" {...rest}>
      <path d="M4 4C4 3.4 4.4 3 5 3H15L20 8V20C20 20.6 19.6 21 19 21H5C4.4 21 4 20.6 4 20V4Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" />
      <path d="M15 3V8H20" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill="#38bdf8" fillOpacity="0.3" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="16" x2="14" y2="16" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomLocalOfferIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f43f5e';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Price Tag" {...rest}>
      <path d="M20.5 12.5L12.5 20.5C12 21 11.2 21 10.7 20.5L3.5 13.3C3.2 13 3 12.5 3 12V4C3 3.4 3.4 3 4 3H12C12.5 3 13 3.2 13.3 3.5L20.5 10.7C21 11.2 21 12 20.5 12.5Z" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.18" />
      <circle cx="7.5" cy="7.5" r="1.5" fill={strokeColor} />
    </svg>
  );
};

export const CustomPeopleIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#2563eb';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Users Directory" {...rest}>
      <circle cx="9" cy="7.5" r="3.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.2" />
      <path d="M2.5 19C2.5 15.5 5.5 13.5 9 13.5C12.5 13.5 15.5 15.5 15.5 19" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill={strokeColor} fillOpacity="0.15" />
      <circle cx="16.5" cy="7.5" r="2.8" stroke="#0ea5e9" strokeWidth="1.4" fill="#38bdf8" fillOpacity="0.2" />
      <path d="M16 13.5C18.5 13.8 21.5 15.2 21.5 18.5" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const CustomAccountCircleIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="User Avatar" {...rest}>
      <circle cx="12" cy="12" r="9.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" />
      <circle cx="12" cy="9" r="3.2" stroke={strokeColor} strokeWidth="1.6" fill={strokeColor} fillOpacity="0.2" />
      <path d="M5.5 19C6.8 15.8 9.2 14.5 12 14.5C14.8 14.5 17.2 15.8 18.5 19" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" fill={strokeColor} fillOpacity="0.2" />
    </svg>
  );
};

export const CustomBadgeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Staff ID Badge" {...rest}>
      <rect x="4" y="6" width="16" height="15" rx="2.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.14" />
      <rect x="9" y="3" width="6" height="4" rx="1" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" />
      <circle cx="12" cy="11.5" r="2.5" fill="#0284c7" />
      <rect x="7.5" y="16" width="9" height="2" rx="1" fill="#64748b" />
    </svg>
  );
};

export const CustomSupportAgentIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0d9488';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Support Agent" {...rest}>
      <path d="M4 13C4 8.6 7.6 5 12 5C16.4 5 20 8.6 20 13V15.5C20 17.4 18.4 19 16.5 19H14" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="11" r="3.5" fill="#38bdf8" fillOpacity="0.3" stroke={strokeColor} strokeWidth="1.6" />
      <rect x="2.5" y="12" width="3" height="5" rx="1.5" fill="#f59e0b" />
      <rect x="18.5" y="12" width="3" height="5" rx="1.5" fill="#f59e0b" />
      <circle cx="13" cy="19" r="1.5" fill={strokeColor} />
    </svg>
  );
};

export const CustomShoppingCartIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Cart" {...rest}>
      <circle cx="9" cy="20" r="1.8" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="18" cy="20" r="1.8" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <path d="M2 3H5L7.5 15H19L21.5 6H6" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.14" />
    </svg>
  );
};

export const CustomTrendingUpIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Trend Up" {...rest}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="16 7 22 7 22 13" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomReceiptLongIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Receipt" {...rest}>
      <path d="M5 2V21L7.5 19.5L10 21L12 19.5L14.5 21L17 19.5L19 21V2L17 3.5L14.5 2L12 3.5L10 2L7.5 3.5L5 2Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" strokeLinejoin="round" />
      <line x1="8" y1="7" x2="16" y2="7" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="11" x2="16" y2="11" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="15" x2="13" y2="15" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

export const CustomCreditCardIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#1e40af';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Credit Card" {...rest}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.18" />
      <line x1="2" y1="9.5" x2="22" y2="9.5" stroke="#1e293b" strokeWidth="2.2" />
      <rect x="5" y="13.5" width="4" height="2.5" rx="0.5" fill="#f59e0b" />
    </svg>
  );
};

export const CustomAccountBalanceIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Bank Balance" {...rest}>
      <path d="M12 3L3 7.5V9H21V7.5L12 3Z" fill="#0284c7" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="2" y1="20" x2="22" y2="20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="10" x2="5" y2="19" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="10" x2="10" y2="19" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="19" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="10" x2="19" y2="19" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomEWalletIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="E-Wallet" {...rest}>
      <path
        d="M3 7C3 5.9 3.9 5 5 5H18C19.1 5 20 5.9 20 7V9H4C3.4 9 3 8.6 3 8V7Z"
        fill={strokeColor}
        fillOpacity="0.18"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="8.5"
        width="18"
        height="12"
        rx="2.5"
        stroke={strokeColor}
        strokeWidth="1.8"
        fill={strokeColor}
        fillOpacity="0.15"
      />
      <path
        d="M15 12H19.5C20.3 12 21 12.7 21 13.5V15.5C21 16.3 20.3 17 19.5 17H15V12Z"
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth="1.6"
      />
      <circle cx="17.5" cy="14.5" r="1" fill="#ffffff" />
      <path
        d="M7 13.5C8 13.5 8.8 14.3 8.8 15.3"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const CustomWalletIcon = CustomEWalletIcon;

export const CustomCashIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#16a34a';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Cash on Delivery" {...rest}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.16" />
      <circle cx="12" cy="12" r="3.2" stroke={strokeColor} strokeWidth="1.8" fill="#22c55e" fillOpacity="0.35" />
      <path d="M6 9V9.01M18 15V15.01" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6 15V15.01M18 9V9.01" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomPaymentsIcon = CustomCashIcon;
export const CustomMoneyBillIcon = CustomCashIcon;

export const CustomLocalGasStationIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#16a34a';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Fuel Rate" {...rest}>
      <rect x="3" y="3" width="11" height="17" rx="2" stroke={strokeColor} strokeWidth="1.8" fill="none" />
      <rect x="5.5" y="6" width="6" height="4.5" rx="1" stroke={strokeColor} strokeWidth="1.4" fill="none" />
      <line x1="7" y1="8.2" x2="10" y2="8.2" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="20" x2="15" y2="20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 9H16.5C17.6 9 18.5 9.9 18.5 11V16.5C18.5 17.6 19.4 18.5 20.5 18.5C21.6 18.5 22.5 17.6 22.5 16.5V9.5L20.5 7.5V5"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export const CustomGasPumpIcon = CustomLocalGasStationIcon;
export const CustomFuelRateIcon = CustomLocalGasStationIcon;

export const CustomCurrencyExchangeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Currency Refund" {...rest}>
      <circle cx="12" cy="12" r="9.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.16" />
      <path d="M12 7V17M9 9.5H15M9 12H15M9 14.5C9 14.5 11 16 13.5 14.5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomPictureAsPdfIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="PDF Document" {...rest}>
      <path d="M5 3C4.4 3 4 3.4 4 4V20C4 20.6 4.4 21 5 21H19C19.6 21 20 20.6 20 20V8L15 3H5Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.1" />
      <path d="M15 3V8H20" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" fill="#fee2e2" />
      <rect x="6.5" y="11.5" width="11" height="6" rx="1" fill={strokeColor} />
      <text x="12" y="16" fill="#ffffff" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">PDF</text>
    </svg>
  );
};

export const CustomStarIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Star Rating" {...rest}>
      <polygon points="12,2 15,8.5 22,9.2 17,14.2 18.5,21.5 12,17.8 5.5,21.5 7,14.2 2,9.2 9,8.5" fill={strokeColor} stroke="#d97706" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomRateReviewIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Review Feedback" {...rest}>
      <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H7V22L12 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="#0284c7" fillOpacity="0.14" stroke="#0284c7" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13.5 6.5L16.5 9.5L10 16H7V13L13.5 6.5Z" fill={strokeColor} stroke="#b45309" strokeWidth="1.2" />
    </svg>
  );
};

export const CustomThumbUpOutlinedIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Thumbs Up" {...rest}>
      <path d="M7 10V21H3V10H7ZM7 10L12 3C13 3 14 4 14 5.5V9H19.5C20.6 9 21.5 10 21.3 11.2L20 19C19.8 19.8 19.2 21 18.2 21H7" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.15" />
    </svg>
  );
};

export const CustomVerifiedIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Verified" {...rest}>
      <path d="M12 2L14.3 4.2L17.5 4.3L18.6 7.4L21.3 9.1L20.8 12.3L22.2 15.2L19.9 17.5L19.5 20.7L16.3 21.3L14.3 23.8L12 22.5L9.7 23.8L7.7 21.3L4.5 20.7L4.1 17.5L1.8 15.2L3.2 12.3L2.7 9.1L5.4 7.4L6.5 4.3L9.7 4.2L12 2Z" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 12L11 14.5L15.5 9.5" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomImageIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Image Preview" {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" />
      <circle cx="8.5" cy="8.5" r="2" fill="#f59e0b" />
      <path d="M21 15L16 10L6 20" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="#38bdf8" fillOpacity="0.2" />
      <path d="M14 17L17 14L21 18" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomImageOutlinedIcon = CustomImageIcon;
export const CustomPhotoLibraryOutlinedIcon = CustomImageIcon;

export const CustomVideocamIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#6366f1';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Video Camera" {...rest}>
      <rect x="2" y="6" width="14" height="12" rx="2.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.16" />
      <path d="M16 10L21 6.5V17.5L16 14V10Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomViewModuleIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Grid View" {...rest}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" />
    </svg>
  );
};

export const CustomViewListIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="List View" {...rest}>
      <line x1="8" y1="6" x2="21" y2="6" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8" y1="12" x2="21" y2="12" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8" y1="18" x2="21" y2="18" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.5" fill="#f59e0b" />
      <circle cx="4" cy="12" r="1.5" fill="#f59e0b" />
      <circle cx="4" cy="18" r="1.5" fill="#f59e0b" />
    </svg>
  );
};

export const CustomNotificationsActiveIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f59e0b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Notification Alert" {...rest}>
      <path d="M12 3C8.7 3 6 5.7 6 9V14L4 16V17H20V16L18 14V9C18 5.7 15.3 3 12 3Z" fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 8C22.2 9.5 22.8 11.2 22.8 13" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M3 8C1.8 9.5 1.2 11.2 1.2 13" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

export const CustomChatBubbleOutlinedIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Chat Message" {...rest}>
      <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H6V22L11 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.14" strokeLinejoin="round" />
      <circle cx="8" cy="10" r="1.3" fill={strokeColor} />
      <circle cx="12" cy="10" r="1.3" fill={strokeColor} />
      <circle cx="16" cy="10" r="1.3" fill={strokeColor} />
    </svg>
  );
};

export const CustomCategoryIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Category" {...rest}>
      <circle cx="6" cy="6" r="3.5" fill="#3b82f6" fillOpacity="0.25" stroke="#2563eb" strokeWidth="1.6" />
      <polygon points="18,2.5 21.5,8.5 14.5,8.5" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.6" />
      <rect x="2.5" y="14" width="7" height="7" rx="1.5" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="1.6" />
      <circle cx="18" cy="17.5" r="3.5" fill="#8b5cf6" fillOpacity="0.25" stroke="#8b5cf6" strokeWidth="1.6" />
    </svg>
  );
};

export const CustomDevicesIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#6366f1';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Devices" {...rest}>
      <rect x="2" y="5" width="15" height="11" rx="2" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" />
      <path d="M1 18H18" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <rect x="16" y="9" width="6" height="11" rx="1.5" stroke="#0ea5e9" strokeWidth="1.6" fill="#ffffff" />
      <line x1="18.5" y1="18" x2="19.5" y2="18" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const CustomHubIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#8b5cf6';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Network Hub" {...rest}>
      <circle cx="12" cy="12" r="3.5" fill={strokeColor} stroke="#ffffff" strokeWidth="1.2" />
      <circle cx="4" cy="6" r="2.5" fill="#0ea5e9" />
      <circle cx="20" cy="6" r="2.5" fill="#0ea5e9" />
      <circle cx="12" cy="20" r="2.5" fill="#10b981" />
      <line x1="6" y1="7.5" x2="9.5" y2="10" stroke="#94a3b8" strokeWidth="1.6" />
      <line x1="18" y1="7.5" x2="14.5" y2="10" stroke="#94a3b8" strokeWidth="1.6" />
      <line x1="12" y1="15.5" x2="12" y2="17.5" stroke="#94a3b8" strokeWidth="1.6" />
    </svg>
  );
};

export const CustomBlockIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Blocked" {...rest}>
      <circle cx="12" cy="12" r="9.5" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.14" />
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomAutoFixHighIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#a855f7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Auto Process" {...rest}>
      <path d="M14.5 4.5L19.5 9.5L7 22H2V17L14.5 4.5Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.18" strokeLinejoin="round" />
      <path d="M12.5 6.5L17.5 11.5" stroke="#f59e0b" strokeWidth="1.6" />
      <path d="M8 3L9 5L11 6L9 7L8 9L7 7L5 6L7 5L8 3Z" fill="#fbbf24" />
      <circle cx="18" cy="3" r="1.2" fill="#fbbf24" />
    </svg>
  );
};

export const CustomConstructionIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#f97316';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Maintenance" {...rest}>
      <path d="M14.5 3.5C12.5 3.5 11 5 11 7C11 7.8 11.3 8.5 11.7 9L3.5 17.2C2.8 17.9 2.8 19.1 3.5 19.8L4.2 20.5C4.9 21.2 6.1 21.2 6.8 20.5L15 12.3C15.5 12.7 16.2 13 17 13C19 13 20.5 11.5 20.5 9.5C20.5 8.9 20.3 8.3 20 7.8L17.5 10.3L15.7 8.5L18.2 6C17.7 5.7 17.1 5.5 16.5 5.5" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={strokeColor} fillOpacity="0.18" />
    </svg>
  );
};

export const CustomSquareFootIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#eab308';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Square Dimension" {...rest}>
      <path d="M4 4V20H20V15H9V4H4Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.2" strokeLinejoin="round" />
      <line x1="9" y1="8" x2="6.5" y2="8" stroke="#475569" strokeWidth="1.4" />
      <line x1="9" y1="12" x2="6.5" y2="12" stroke="#475569" strokeWidth="1.4" />
      <line x1="13" y1="15" x2="13" y2="17.5" stroke="#475569" strokeWidth="1.4" />
      <line x1="17" y1="15" x2="17" y2="17.5" stroke="#475569" strokeWidth="1.4" />
    </svg>
  );
};

export const CustomFitnessCenterIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Material Weight" {...rest}>
      <line x1="6" y1="12" x2="18" y2="12" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="4" y="8" width="2" height="8" rx="0.8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <rect x="2" y="9.5" width="2" height="5" rx="0.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <rect x="18" y="8" width="2" height="8" rx="0.8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <rect x="20" y="9.5" width="2" height="5" rx="0.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
    </svg>
  );
};

export const CustomPrecisionManufacturingIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0891b2';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Precision Fabrication" {...rest}>
      <rect x="7" y="3" width="10" height="5" rx="1.5" stroke={strokeColor} strokeWidth="1.6" fill={strokeColor} fillOpacity="0.2" />
      <path d="M12 8V14M9 14H15L13 18H11L9 14Z" stroke="#f97316" strokeWidth="1.8" strokeLinejoin="round" fill="#f97316" fillOpacity="0.25" />
      <line x1="3" y1="21" x2="21" y2="21" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomFiberManualRecordIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Live Status" {...rest}>
      <circle cx="12" cy="12" r="8" fill={strokeColor} fillOpacity="0.2" />
      <circle cx="12" cy="12" r="4.5" fill={strokeColor} />
    </svg>
  );
};

export const CustomMailOutlinedIcon = CustomMailIcon;
export const CustomPhoneInTalkOutlinedIcon = CustomPhoneIcon;
export const CustomPhoneAndroidIcon = CustomPhoneIcon;
export const CustomPlaceOutlinedIcon = CustomLocationOnIcon;
export const CustomLocationOnOutlinedIcon = CustomLocationOnIcon;
export const CustomPersonOutlinedIcon = CustomAccountCircleIcon;
export const CustomLockOutlinedIcon = CustomLockIcon;
export const CustomPendingActionsIcon = CustomHourglassEmptyIcon;

export const CustomActivityIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#10b981';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Activity" {...rest}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const CustomRefreshCwIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Refresh" {...rest}>
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M3 3V8H8" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12A9 9 0 0 0 18 18.7L21 16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M21 21V16H16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomPowerIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#ef4444';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Power" {...rest}>
      <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="12" y1="2" x2="12" y2="12" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

export const CustomCpuIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="CPU" {...rest}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.15" />
      <rect x="9" y="9" width="6" height="6" stroke="#38bdf8" strokeWidth="1.5" fill="#38bdf8" fillOpacity="0.3" />
      <path d="M9 1V4M15 1V4M9 20V23M15 20V23M1 9H4M1 15H4M20 9H23M20 15H23" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const CustomWifiIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0ea5e9';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Wi-Fi" {...rest}>
      <path d="M5 12.55A11 11 0 0 1 19 12.55" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M1.42 9A16 16 0 0 1 22.58 9" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M8.53 16.11A6 6 0 0 1 15.47 16.11" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="20" r="1.5" fill={strokeColor} />
    </svg>
  );
};

export const CustomGlobeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Globe" {...rest}>
      <circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.12" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#38bdf8" strokeWidth="1.5" />
      <path d="M12 2A15.3 15.3 0 0 1 16 12A15.3 15.3 0 0 1 12 22A15.3 15.3 0 0 1 8 12A15.3 15.3 0 0 1 12 2Z" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export const CustomServerIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#475569';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Server" {...rest}>
      <rect x="2" y="3" width="20" height="8" rx="2" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.18" />
      <rect x="2" y="13" width="20" height="8" rx="2" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.18" />
      <circle cx="6" cy="7" r="1.2" fill="#10b981" />
      <circle cx="6" cy="17" r="1.2" fill="#10b981" />
      <line x1="14" y1="7" x2="18" y2="7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="17" x2="18" y2="17" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const CustomDatabaseIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Database" {...rest}>
      <ellipse cx="12" cy="5" rx="9" ry="3" stroke={strokeColor} strokeWidth="2" fill="#38bdf8" fillOpacity="0.25" />
      <path d="M21 12C21 13.66 16.97 15 12 15C7.03 15 3 13.66 3 12" stroke={strokeColor} strokeWidth="2" fill="none" />
      <path d="M3 5V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V5" stroke={strokeColor} strokeWidth="2" fill="none" />
    </svg>
  );
};

export const CustomTerminalIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#1e293b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Terminal" {...rest}>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke={strokeColor} strokeWidth="2" fill="#0f172a" />
      <polyline points="5 9 8 12 5 15" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="15" x2="16" y2="15" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomHardDriveIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#475569';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Hard Drive" {...rest}>
      <line x1="22" y1="12" x2="2" y2="12" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M5.45 5.11L2 12V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V12L18.55 5.11A2 2 0 0 0 16.76 4H7.24A2 2 0 0 0 5.45 5.11Z" stroke={strokeColor} strokeWidth="2" fill={strokeColor} fillOpacity="0.15" />
      <line x1="6" y1="16" x2="6.01" y2="16" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="16" x2="10.01" y2="16" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomHomeIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Home" {...rest}>
      <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V10.5Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.12" strokeLinejoin="round" />
    </svg>
  );
};

export const CustomDescriptionIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#64748b';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Document" {...rest}>
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.1" strokeLinejoin="round" />
      <path d="M14 2V8H20" stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="17" x2="13" y2="17" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

export const CustomInfoIcon = (props) => {
  const { width, height, viewBox, className, style, resolvedColor, ...rest } = resolveCustomIconProps(props);
  const strokeColor = resolvedColor || '#0284c7';
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} style={style} role="img" aria-label="Information" {...rest}>
      <circle cx="12" cy="12" r="9.5" stroke={strokeColor} strokeWidth="1.8" fill={strokeColor} fillOpacity="0.14" />
      <circle cx="12" cy="8" r="1.2" fill={strokeColor} />
      <line x1="12" y1="11.5" x2="12" y2="16.5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const CustomInfoOutlinedIcon = CustomInfoIcon;

