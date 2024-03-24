import type { MapCreator } from 'nanostores'

import { creatorLogger } from '../index.js'

function createCreator(): MapCreator {
  let creator: any = () => {}
  creator.cache = {}
  return creator
}

let $creator = createCreator()

let destroy = creatorLogger(
  { $creator },
  {
    messages: {
      build: false,
      mount: false
    }
  }
)

destroy()
