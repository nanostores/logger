import { logger } from '../logger/index.js'
import { log } from '../printer/index.js'

function onBuild(creator, listener) {
  let originBuild = creator.build
  creator.build = (...args) => {
    let store = originBuild(...args)
    listener(store)
    return store
  }
  return () => {
    creator.build = originBuild
  }
}

function createCreatorLogger(creator, creatorName, opts) {
  let nameGetter = opts.nameGetter
  delete opts.nameGetter

  let unbind = []
  unbind.push(
    onBuild(creator, store => {
      let storeName = nameGetter(creatorName, store)

      log({
        logo: true,
        message: [
          ['bold', storeName],
          ['regular', 'store was built by'],
          ['bold', creatorName],
          ['regular', 'creator']
        ],
        type: 'mount'
      })

      unbind.push(logger({ [storeName]: store }, opts))
    })
  )

  return () => {
    for (let i of unbind) i()
  }
}

const defaultNameGetter = (creatorName, store) => {
  return `${creatorName}:${store.value.id}`
}

export function creatorLogger(creators, opts = {}) {
  opts = {
    nameGetter: defaultNameGetter,
    ...opts
  }
  let unbind = Object.entries(creators).map(([creatorName, creator]) =>
    createCreatorLogger(creator, creatorName, opts)
  )
  return () => {
    for (let i of unbind) i()
  }
}
