import type { AnyStore, Store, StoreValue } from 'nanostores'

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

interface EventPayloadBase {
  storeName: string
}

interface EventChangePayload extends EventPayloadBase {
  actionId?: number
  actionName?: string
  changed?: keyof StoreValue<Store>
  newValue: any
  oldValue?: any
  valueMessage?: string
}

interface EventActionPayload extends EventPayloadBase {
  actionId: number
  actionName: string
}

interface EventActionStartPayload extends EventActionPayload {
  args: any[]
}

interface EventActionErrorPayload extends EventActionPayload {
  error: Error
}

interface BuildLoggerEvents {
  action?: {
    end?: (payload: EventActionPayload) => void
    error?: (payload: EventActionErrorPayload) => void
    start?: (payload: EventActionStartPayload) => void
  }
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
 *   },
 *
 *   action: {
 *     start: ({ actionName, args }) => {
 *       let message = `${actionName} was started`
 *       if (args.length) message += 'with arguments'
 *       console.log(message, args)
 *     },
 *
 *     error: ({ actionName, error }) => {
 *       console.log(`${actionName} was failed`, error)
 *     },
 *
 *     end: ({ actionName }) => {
 *       console.log(`${actionName} was ended`)
 *     }
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
