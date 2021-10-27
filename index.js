import { lastAction, onBuild, onMount, onSet, onStop } from 'nanostores'

import { log, group } from './printer.js'

let handleSet = (storeName, store) =>
  onSet(store, ({ changed, newValue }) => {
    let actionName = store[lastAction]
    group(
      () => {
        log({
          actionName,
          changed,
          newValue,
          oldValue: store.get(),
          logType: 'change'
        })
      },
      { logType: 'change', storeName, value: newValue }
    )
  })

let handleMount = (storeName, store) =>
  onMount(store, () => {
    group(
      () => {
        log({ message: 'Store was mounted' })
      },
      { logType: 'mount', storeName }
    )
    return () => {
      group(
        () => {
          log({ message: 'Store was unmounted' })
        },
        { logType: 'unmount', storeName }
      )
    }
  })

let storeLogger = (storeName, store) => {
  let unsubs = [handleSet(storeName, store), handleMount(storeName, store)]
  return () => unsubs.map(fn => fn())
}

let templateLogger = (templateName, template) =>
  onBuild(template, ({ store }) => {
    let storeName = `${templateName}-${store.get().id}`
    group(
      () => {
        log({
          message: `Logger was connected to ${storeName}`
        })
      },
      { logType: 'build', storeName }
    )
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
