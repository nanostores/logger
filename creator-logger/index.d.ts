import type { MapCreator, MapStore } from 'nanostores'

import type { LoggerOptions } from '../build-logger/index.js'

interface CreatorLoggerOptions extends LoggerOptions {
  /**
   * Custom name getter for stores built with creators.
   *
   * @param creatorName Name of the creator.
   * @param store Store built by the creator.
   * @returns Custom store name.
   */
  nameGetter: (creatorName: string, store: MapStore) => string
}

/**
 * Displays Nano Stores events in browser console.
 *
 * @param creators Creators for logging.
 * @param opts Logger options.
 */
export function creatorLogger(
  creators: { [key: string]: MapCreator },
  opts?: CreatorLoggerOptions
): () => void
