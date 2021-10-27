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

let templateLogger = (templateName, template) =>
  onBuild(template, ({ store }) => {
    let storeName = `${templateName}-${store.get().id}`
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

let handle = ([storeName, store]) =>
  store.build ? templateLogger(storeName, store) : storeLogger(storeName, store)

export let logger = deps => {
  deps = Object.entries(deps)
  let unsubs = deps.map(handle)
  return () => unsubs.map(fn => fn())
}
