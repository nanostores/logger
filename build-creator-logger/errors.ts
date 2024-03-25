import { atom } from 'nanostores'

import { buildCreatorLogger } from '../index.js'

let $atom = atom()

// THROWS Argument of type '{}' is not assignable to
buildCreatorLogger($atom, 'Atom', {})

buildCreatorLogger($atom, 'Atom', {
  // THROWS 'mount' does not exist in typ
  mount: () => {}
})

buildCreatorLogger(
  $atom,
  'Atom',
  {
    build: () => {}
  },
  {
    messages: {
      // THROWS 'mount' does not exist in type
      mount: false
    }
  }
)
