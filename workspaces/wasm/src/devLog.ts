/**
 * Development logging utilities that are enabled in development mode.
 *
 * Usage:
 * - Logging is automatically enabled in development mode (`import.meta.env.DEV`)
 * - In production builds, logging is automatically disabled
 *
 * @example
 * ```ts
 * import { devInfo } from './devLog';
 *
 * devInfo('WASM initialized');
 * ```
 */

/**
 * Check if logging is enabled.
 * Uses Vite's environment detection - enabled in development mode only.
 * This is determined at build time, so no runtime window access is needed.
 *
 * @returns true if running in development mode
 */
function isLoggingEnabled(): boolean {
  // In Vite, import.meta.env.DEV is true in development mode
  // This is replaced at build time, so no runtime evaluation needed
  return import.meta.env.DEV;
}

/**
 * Development info logger that only logs when enabled (development mode).
 *
 * @param args - Arguments to pass to console.info
 */
export function devInfo(...args: unknown[]): void {
  if (isLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
}
