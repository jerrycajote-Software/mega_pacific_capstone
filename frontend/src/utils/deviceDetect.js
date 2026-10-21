/**
 * Utility for detecting mobile browsers and touch devices
 * Safeguards heavy WebGL 3D components and adapts customer views.
 * Strictly verifies physical hardware dimensions and touch sensors
 * so mobile browsers cannot bypass via "Desktop Site" mode.
 */

export const isMobileBrowser = () => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // Physical screen dimensions in CSS pixels (immune to "Desktop site" virtual viewport scaling)
  const screenMin = Math.min(window.screen?.width || 0, window.screen?.height || 0);
  const isPhysicalMobileScreen = screenMin > 0 && screenMin < 768;

  const isNarrowViewport = window.innerWidth < 1024;

  const isCoarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

  if (isMobileUA) return true;

  // 2. Physical phone screen + touch (catches "Desktop site" mode on mobile phones)
  if (isTouchDevice && isPhysicalMobileScreen) return true;

  if (isCoarsePointer && screenMin < 850) return true;

  if (isTouchDevice && isNarrowViewport) return true;

  return false;
};

export default isMobileBrowser;
