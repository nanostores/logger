import type { AnyStore } from 'nanostores'

export function logger(stores: { [key: string]: AnyStore }): () => void
