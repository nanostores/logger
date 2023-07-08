import type { MapCreator } from 'nanostores'

import type { CreatorLoggerOptions } from '../build-creator-logger/index.js'
import type { LoggerOptions } from '../build-logger/index.js'

/**
 * Displays Nano Stores events in browser console.
 *
 * @param creators Creators for logging.
 * @param opts Logger options.
 */
export function creatorLogger(
  creators: { [key: string]: MapCreator },
  opts?: CreatorLoggerOptions & LoggerOptions
): () => void
