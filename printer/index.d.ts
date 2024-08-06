type LogType =
  | 'arguments'
  | 'build'
  | 'change'
  | 'error'
  | 'mount'
  | 'new'
  | 'old'
  | 'unmount'
  | 'value'
  | {
      color: string
      name: string
    }

type LogMessageStyle = 'bold' | 'regular'

interface CreateLogOptions {
  /**
   * Whether to display the Nano Stores logo.
   */
  logo?: boolean
  /**
   * Message in string or array format to be logged.
   */
  message?: [LogMessageStyle, string][] | string
  /**
   * The type of log.
   */
  type: LogType
  /**
   * Any value, object or array to be logged.
   */
  value?: any
}

/**
 * Creates a log message.
 *
 * @param options Object with the options to create the log message.
 */
export function log(options: CreateLogOptions): void

/**
 * Creates a collapsed log message.
 *
 * @param options Object with the options to create the log message.
 */
export function group(options: CreateLogOptions): void

/**
 * Exits the current collapsed log message.
 */
export function groupEnd(): void
