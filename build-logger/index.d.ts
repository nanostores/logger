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

export function buildLogger(
  stores: AnyStore,
  storeName: string,
  events: BuildLoggerEvents,
  opts?: LoggerOptions
): () => void
