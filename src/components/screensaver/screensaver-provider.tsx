/**
 * ScreensaverProvider Component
 * Conditionally renders screensaver based on feature flags
 * Client-side only to prevent hydration issues
 */

"use client";

import { SCREENSAVER_ENABLED } from './index';
import FloatingScreensaver from './floating-screensaver';

export function ScreensaverProvider() {
  // Feature flag check - only render when enabled
  if (!SCREENSAVER_ENABLED) {
    return null;
  }

  return <FloatingScreensaver />;
}