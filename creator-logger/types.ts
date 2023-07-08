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
    ignoreActions: ['Increase Value'],
    messages: {
      build: false,
      mount: false
    }
  }
)

destroy()
