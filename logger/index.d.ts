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

export interface LoggerOptions {
  /**
   * Disable logs of actions with a specific name.
   */
  ignoreActions?: string[]

  /**
   * Disable specific types of logs.
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
 *   'Profile': $profile,
 *   'Users': $users
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
