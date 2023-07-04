import type { AnyStore } from 'nanostores'

import type { LoggerOptions } from '../build-logger/index.js'

/**
 * Displays Nano Stores events in browser console.
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
