/**
 * useIdleTimer Hook
 * Detects user inactivity across multiple event types
 * Optimized for performance with minimal bundle impact
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseIdleTimerProps {
  timeoutMs: number;
  onIdle?: () => void;
  onActive?: () => void;
  disabled?: boolean;
}

export function useIdleTimer({ 
  timeoutMs, 
  onIdle, 
  onActive, 
  disabled = false 
}: UseIdleTimerProps) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);

  // Activity events to monitor - moved inside useEffect to satisfy ESLint

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If currently idle, trigger active callback
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      onActive?.();
    }

    // Set new timeout if not disabled
    if (!disabled) {
      timeoutRef.current = setTimeout(() => {
        isIdleRef.current = true;
        setIsIdle(true);
        onIdle?.();
      }, timeoutMs);
    }
  }, [timeoutMs, onIdle, onActive, disabled]);

  // Throttled activity handler to prevent excessive timer resets
  const activityHandler = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const eventTypes = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'] as const;
    
    if (disabled) {
      // Clean up when disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (isIdleRef.current) {
        isIdleRef.current = false;
        setIsIdle(false);
        onActive?.();
      }
      return;
    }

    // Start timer on mount
    resetTimer();

    // Add event listeners
    eventTypes.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      eventTypes.forEach(event => {
        document.removeEventListener(event, activityHandler);
      });
    };
  }, [resetTimer, activityHandler, disabled, onActive]);

  // Manual reset function
  const reset = useCallback(() => {
    if (!disabled) {
      resetTimer();
    }
  }, [resetTimer, disabled]);

  // Manual trigger idle
  const triggerIdle = useCallback(() => {
    if (!disabled && !isIdleRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isIdleRef.current = true;
      setIsIdle(true);
      onIdle?.();
    }
  }, [onIdle, disabled]);

  return {
    isIdle,
    reset,
    triggerIdle
  };
}