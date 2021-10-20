import { Atom, MapStore, MapTemplate } from 'nanostores'

export function logger(deps: {
  [key: string]: Atom | MapTemplate | MapStore
}): () => void
