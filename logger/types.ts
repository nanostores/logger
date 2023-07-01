import { atom, deepMap, map } from 'nanostores'

import { logger } from '../index.js'

let atomStore = atom(0)
let mapStore = map({ a: 1 })
let deepMapStore = deepMap({ a: { b: 1 } })

let destroy = logger({
  'Atom': atomStore,
  'Deep map': deepMapStore,
  'Map': mapStore
})

destroy()

logger(
  { atomStore },
  {
    ignoreActions: ['set'],
    messages: {
      mount: false
    }
  }
)
