import { atom } from 'nanostores'

import { buildCreatorLogger } from '../index.js'

let $atom = atom()

let destroy = buildCreatorLogger(
  $atom,
  'Atom',
  {
    build: ({ creatorName, store, storeName }) => {
      console.log(`${storeName} was built by ${creatorName}`, store)
    }
  },
  {
    messages: {
      build: false
    },
    nameGetter: (creatorName, store) => `${creatorName}:${store.value.id}`
  }
)

destroy()
