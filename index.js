import { lastAction, onBuild, onMount, onSet, onStop } from 'nanostores'

import { log } from './printer.js'

let handleSet = (storeName, store) =>
  onSet(store, ({ changed, newValue }) => {
    let actionName = store[lastAction]
    log(
      {
        logType: 'change',
        storeName,
        group: {
          actionName,
          changed,
          newValue,
          oldValue: store.get()
        }
      }
    )
  })

let handleMount = (storeName, store) =>
  onMount(store, () => {
    log({
      logType: 'mount',
      storeName,
      message: 'was mounted'
    })
    return () => {
      log({
        logType: 'unmount',
        storeName,
        message: 'was unmounted'
      })
    }
  })

let storeLogger = (storeName, store) => {
  let unsubs = [handleSet(storeName, store), handleMount(storeName, store)]
  return () => unsubs.map(fn => fn())
}

let templateLogger = (templateName, template, nameGetter) =>
  onBuild(template, ({ store }) => {
    let storeName = nameGetter(store, templateName)
    log({
      logType: 'build',
      storeName: templateName,
      message: `built ${storeName}`
    })
    let unsubLog = storeLogger(storeName, store)
    let usubStop = onStop(store, () => {
      unsubLog()
      usubStop()
    })
  })

let handle = ([storeName, store], nameGetter) =>
  store.build
    ? templateLogger(storeName, store, nameGetter)
    : storeLogger(storeName, store)

let defaultNameGetter = (store, templateName) =>
  `${templateName}-${store.get().id}`

export let logger = (deps, opts = {}) => {
  deps = Object.entries(deps)
  let nameGetter = opts.nameGetter || defaultNameGetter
  let unsubs = deps.map(i => handle(i, nameGetter))
  return () => unsubs.map(fn => fn())
}
