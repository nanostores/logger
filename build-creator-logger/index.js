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

const defaultNameGetter = (creatorName, store) => {
  return `${creatorName}:${store.value.id}`
}

export function buildCreatorLogger(creator, creatorName, events, opts = {}) {
  opts = {
    nameGetter: defaultNameGetter,
    ...opts
  }

  let messages = opts.messages || {}
  let unbind = []

  if (messages.build !== false) {
    unbind.push(
      onBuild(creator, store => {
        let storeName = opts.nameGetter(creatorName, store)
        events.build({ creatorName, store, storeName })
      })
    )
  }

  return () => {
    for (let i of unbind) i()
  }
}
