type LogType =
  | 'action'
  | 'arguments'
  | 'build'
  | 'change'
  | 'error'
  | 'mount'
  | 'new'
  | 'old'
  | 'unmount'
  | 'value'

type LogMessageStyle = 'bold' | 'regular'

interface CreateLogOptions {
  logo?: boolean
  message?: [LogMessageStyle, string][] | string
  type: LogType
  value: any
}

export function log(options: CreateLogOptions): void
export function group(options: CreateLogOptions): void
export function groupEnd(): void
