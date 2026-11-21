import { useRef, useState, useCallback, useEffect } from 'react';

// Detects a touch long-press gesture without interfering with normal taps or page scrolling
export const useLongPress = (
  onLongPress,
  { delay = 450, moveThreshold = 10, enabled = true } = {}
) => {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(null);
  const resetTriggerTimerRef = useRef(null);
  const startPointRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  const clearPressTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPressTimer();
      if (resetTriggerTimerRef.current) {
        clearTimeout(resetTriggerTimerRef.current);
      }
    };
  }, [clearPressTimer]);

  const handleTouchStart = useCallback(
    (event) => {
      if (!enabled) return;
      if (!event.touches || event.touches.length !== 1) return;

      const touch = event.touches[0];
      startPointRef.current = { x: touch.clientX, y: touch.clientY };
      longPressTriggeredRef.current = false;
      clearPressTimer();
      setIsPressing(true);

      timerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setIsPressing(false);

        // Provide subtle haptic feedback when supported by the mobile browser
        try {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(18);
          }
        } catch {
          // Ignore vibration permission restrictions
        }

        if (typeof onLongPressRef.current === 'function') {
          onLongPressRef.current(event);
        }
      }, delay);
    },
    [enabled, delay, clearPressTimer]
  );

  const handleTouchMove = useCallback(
    (event) => {
      if (!startPointRef.current || !event.touches || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - startPointRef.current.x;
      const deltaY = touch.clientY - startPointRef.current.y;

      // Cancel long press if the user begins scrolling or swiping
      if (Math.hypot(deltaX, deltaY) > moveThreshold) {
        clearPressTimer();
        startPointRef.current = null;
        setIsPressing(false);
      }
    },
    [moveThreshold, clearPressTimer]
  );

  const handleTouchEndOrCancel = useCallback(() => {
    clearPressTimer();
    startPointRef.current = null;
    setIsPressing(false);

    // Keep the triggered flag briefly so the trailing click event does not navigate away
    if (longPressTriggeredRef.current) {
      if (resetTriggerTimerRef.current) {
        clearTimeout(resetTriggerTimerRef.current);
      }
      resetTriggerTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = false;
      }, 450);
    }
  }, [clearPressTimer]);

  const handleContextMenu = useCallback(
    (event) => {
      if (!enabled) return;
      const isCoarsePointer =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches;

      // Prevent the native mobile context menu from interrupting long-press previews
      if (isPressing || longPressTriggeredRef.current || isCoarsePointer) {
        event.preventDefault();
      }
    },
    [enabled, isPressing]
  );

  return {
    isPressing,
    longPressTriggeredRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEndOrCancel,
      onTouchCancel: handleTouchEndOrCancel,
      onContextMenu: handleContextMenu,
    },
  };
};

export default useLongPress;
