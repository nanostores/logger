import { atom } from 'nanostores'

import { logger } from '../index.js'

logger({
  // THROWS Type '() => void' is not assignable to type 'AnyStore'.
  Something: () => {}
})

let atomStore = atom()
// THROWS Argument of type 'PreinitializedWritableAtom<unknown> & object'
logger(atomStore)

logger(
  { atomStore },
  {
    // THROWS Type 'string' is not assignable to type 'string[]'
    ignoreActions: 'set',
    messages: {
      // THROWS Type 'string' is not assignable to type 'boolean | undefined'.
      mount: ''
    }
  }
)
