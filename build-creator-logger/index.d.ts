import type { AnyStore, MapStore } from 'nanostores'

interface CreatorLoggerOptionsMessages {
  /**
   * Disable build logs.
   */
  build?: boolean
}

export interface CreatorLoggerOptions {
  messages?: CreatorLoggerOptionsMessages

  /**
   * Custom name getter for stores built with creators.
   *
   * @param creatorName Name of the creator.
   * @param store Store built by the creator.
   * @returns Custom store name.
   */
  nameGetter?: (creatorName: string, store: MapStore) => string
}

interface EventBuildStartPayload {
  creatorName: string
  store: MapStore
  storeName: string
}

interface BuildCreatorLoggerEvents {
  build: (payload: EventBuildPayloadBase) => void
}

/**
 * Builds logger of map creators for Nano Stores.
 *
 * ```js
 * import { buildCreatorLogger } from '@nanostores/logger'
 * import { $profile } from './stores/index.js'
 *
 * let destroy = buildLogger($profile, 'Profile', {
 *   build: ({ creatorName, store, storeName }) => {
 *     console.log(`${storeName} was built by ${creatorName}`, store)
 *   }
 * })
 * ```
 *
 * @param store Creator for logging.
 * @param storeName Store name.
 * @param events Events to log.
 * @param opts Logger options.
 */
export function buildCreatorLogger(
  store: AnyStore,
  storeName: string,
  events: BuildCreatorLoggerEvents,
  opts?: CreatorLoggerOptions
): () => void
