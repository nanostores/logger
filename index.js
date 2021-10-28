import {
  STORE_UNMOUNT_DELAY,
  lastAction,
  onBuild,
  onStart,
  onStop,
  onSet
} from 'nanostores'

import { group, log, nested } from './printer.js'

let handleSet = (storeName, store) =>
  onSet(store, ({ changed, newValue }) => {
    let actionName = store[lastAction]
    let message = [['text', 'was changed in key'], ['bold', changed]]
    if (actionName) {
      message.push(['text', 'by'], ['bold', actionName], ['text', 'action'])
    }
    group(
      { logType: 'change', storeName, message },
      () => {
        nested({
          actionName,
          changed,
          newValue,
          oldValue: store.get(),
          logType: 'change'
        })
      }
    )
  })

let handleMount = (storeName, store) => {
  let unbindStart = onStart(store, () => {
    log({
      logType: 'mount',
      storeName,
      message: 'was mounted'
    })
  })
  let unbindStop = onStop(store, () => {
    setTimeout(() => {
      log({
        logType: 'unmount',
        storeName,
        message: 'was unmounted'
      })
    }, STORE_UNMOUNT_DELAY)
  })
  return () => {
    unbindStart()
    unbindStop()
  }
}

let storeLogger = (storeName, store) => {
  let unsubs = [handleSet(storeName, store), handleMount(storeName, store)]
  return () => unsubs.map(fn => fn())
}

let templateLogger = (templateName, template, nameGetter) =>
  onBuild(template, ({ store }) => {
    let storeName = nameGetter(store, templateName)
    log({
      logType: 'build',
      storeName,
      message: [['text', 'was built by'], ['bold', templateName]]
    })
    let unsubLog = storeLogger(storeName, store)
    let usubStop = onStop(store, () => {
      setTimeout(() => {
        unsubLog()
        usubStop()
      }, STORE_UNMOUNT_DELAY + 1)
    })
  })

let handle = ([storeName, store], nameGetter) =>
  'build' in store
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
