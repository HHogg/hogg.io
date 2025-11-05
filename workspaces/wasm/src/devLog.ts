/**
 * Development logging utilities that are enabled in development mode.
 *
 * Usage:
 * - Logging is automatically enabled in development mode (`import.meta.env.DEV`)
 * - In production builds, logging is automatically disabled
 *
 * @example
 * ```ts
 * import { devLog, devWarn, devError } from './devLog';
 *
 * devLog('WASM initialized');
 * devWarn('Buffer not ready');
 * devError('Failed to start loop', error);
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
 * Development logger that only logs when enabled (development mode).
 *
 * @param args - Arguments to pass to console.log
 */
export function devLog(...args: unknown[]): void {
  if (isLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

/**
 * Development warning logger that only logs when enabled (development mode).
 *
 * @param args - Arguments to pass to console.warn
 */
export function devWarn(...args: unknown[]): void {
  if (isLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

/**
 * Development error logger that only logs when enabled (development mode).
 *
 * @param args - Arguments to pass to console.error
 */
export function devError(...args: unknown[]): void {
  if (isLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
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

/**
 * Development debug logger that only logs when enabled (development mode).
 *
 * @param args - Arguments to pass to console.debug
 */
export function devDebug(...args: unknown[]): void {
  if (isLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
}
