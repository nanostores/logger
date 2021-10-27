import { Atom, MapStore, MapTemplate } from 'nanostores'

type AnyStore = Atom | MapStore | AnySyncTemplate

export function logger(
  deps: {
    [key: string]: AnyStore
  },
  opts?: {
    nameGetter?: (store: AnyStore, templateName: string) => string
  }
): () => void
