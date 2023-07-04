import type { MapCreator, MapStore } from 'nanostores'

import type { LoggerOptions } from '../logger/index.js'

interface CreatorLoggerOptions extends LoggerOptions {
  nameGetter: (creatorName: string, store: MapStore) => string
}

export function creatorLogger(
  creators: { [key: string]: MapCreator },
  opts?: CreatorLoggerOptions
): () => void
