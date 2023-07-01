import type { AnyStore } from 'nanostores'

interface LoggerOptionsMessages {
  /**
   * Disable action logs.
   */
  action?: boolean

  /**
   * Disable change logs.
   */
  change?: boolean

  /**
   * Disable mount logs.
   */
  mount?: boolean

  /**
   * Disable unmount logs.
   */
  unmount?: boolean
}

interface LoggerOptions {
  /**
   * Disable specific log types.
   */
  messages?: LoggerOptionsMessages
}

/**
 * Display Nanostores events in browser console.
 *
 * ```js
 * import { logger } from '@nanostores/logger'
 * import { $profile, $users } from './stores/index.js'
 *
 * let destroy = logger({
 *   'Profile Store': $profile,
 *   'Users Store': $users
 * })
 * ```
 *
 * @param stores Stores for logging.
 * @param opts Logger options.
 * @returns A function to destroy logger.
 */
export function logger(
  stores: { [key: string]: AnyStore },
  opts?: LoggerOptions
): () => void
