import type { AnyStore, Store, StoreValue } from 'nanostores'

interface LoggerOptionsMessages {
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
   * Disable specific types of logs.
   */
  messages?: LoggerOptionsMessages
}

interface EventPayloadBase {
  storeName: string
}

interface EventChangePayload extends EventPayloadBase {
  changed?: keyof StoreValue<Store>
  newValue: any
  oldValue?: any
  valueMessage?: string
}

interface EventActionStartPayload extends EventActionPayload {
  args: any[]
}

interface EventActionErrorPayload extends EventActionPayload {
  error: Error
}

interface BuildLoggerEvents {
  change?: (payload: EventChangePayload) => void
  mount?: (payload: EventPayloadBase) => void
  unmount?: (payload: EventPayloadBase) => void
}

/**
 * Builds logger for Nano Stores.
 *
 * ```js
 * import { buildLogger } from '@nanostores/logger'
 * import { $profile } from './stores/index.js'
 *
 * let destroy = buildLogger($profile, 'Profile', {
 *   mount: ({ storeName }) => {
 *     console.log(`${storeName} was mounted`)
 *   },
 *
 *   unmount: ({ storeName }) => {
 *     console.log(`${storeName} was unmounted`)
 *   },
 *
 *   change: ({ actionName, changed, newValue, oldValue, valueMessage }) => {
 *     let message = `${storeName} was changed`
 *     if (changed) message += `in the ${changed} key`
 *     if (oldValue) message += `from ${oldValue}`
 *     message += `to ${newValue}`
 *     if (actionName) message += `by action ${actionName}`
 *     console.log(message, valueMessage)
 *   }
 * ```
 *
 * @param store Any Nano Store
 * @param storeName Store name.
 * @param events Events to log.
 * @param opts Logger options.
 */
export function buildLogger(
  store: AnyStore,
  storeName: string,
  events: BuildLoggerEvents,
  opts?: LoggerOptions
): () => void
