import { buildCreatorLogger } from '../build-creator-logger/index.js'
import { logger } from '../logger/index.js'
import { log } from '../printer/index.js'

function createCreatorLogger(creator, creatorName, opts) {
  let unbind = []

  unbind.push(
    buildCreatorLogger(
      creator,
      creatorName,
      {
        build: ({ store, storeName }) => {
          log({
            logo: true,
            message: [
              ['bold', storeName],
              ['regular', 'store was built by'],
              ['bold', creatorName],
              ['regular', 'creator']
            ],
            type: 'build'
          })

          unbind.push(logger({ [storeName]: store }, opts))
        }
      },
      opts
    )
  )

  return () => {
    for (let i of unbind) i()
  }
}

export function creatorLogger(creators, opts = {}) {
  let unbind = Object.entries(creators).map(([creatorName, creator]) =>
    createCreatorLogger(creator, creatorName, opts)
  )
  return () => {
    for (let i of unbind) i()
  }
}
