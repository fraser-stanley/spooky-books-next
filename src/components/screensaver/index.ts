/**
 * Screensaver Module Exports
 * Lightweight floating screensaver with spooky GIF animations
 */

export { ScreensaverProvider } from './screensaver-provider';

// Feature flag utility - enabled by default in development, opt-in for production
export const SCREENSAVER_ENABLED = 
  process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_ENABLE_SCREENSAVER === 'true';