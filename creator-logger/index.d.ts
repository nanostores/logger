import type { MapCreator, MapStore } from 'nanostores'

import type { LoggerOptions } from '../logger/index.js'

interface CreatorLoggerOptions extends LoggerOptions {
  nameGetter: (templateName: string, store: MapStore) => string
}

export function creatorLogger(
  templates: { [key: string]: MapCreator },
  opts?: CreatorLoggerOptions
): () => void
