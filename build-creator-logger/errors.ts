import { atom } from 'nanostores'

import { buildCreatorLogger } from '../index.js'

let $atom = atom()

// THROWS Argument of type '{}' is not assignable to
buildCreatorLogger($atom, 'Atom', {})

buildCreatorLogger($atom, 'Atom', {
  // THROWS Argument of type '{ mount: () => void; }' is not assignable to
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
      // THROWS Type '{ mount: false; }' is not assignable to
      mount: false
    }
  }
)
