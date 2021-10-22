import { lastAction, onBuild, onMount, onSet, onStop } from 'nanostores'

let printStyles = background =>
  `color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:${background};`

let styles = {
  bage: printStyles('black'),
  new: printStyles('green'),
  old: printStyles('tomato'),
  action: printStyles('indigo'),
  changed: printStyles('MidnightBlue'),
  message: 'padding-left:4px;padding-right:4px;font-weight:normal;',
  storeName: 'padding-left:4px;padding-right:4px;font-weight:normal;'
}

let logTypesStyles = {
  start: printStyles('blue'),
  create: printStyles('#8f1fff'),
  change: printStyles('green'),
  stop: printStyles('tomato')
}

let group = (cb, { logType, storeName, value }) => {
  let tpl = `%cnanostores`
  let consoleArgs = [styles.bage]
  if (logType) {
    tpl += `%c${logType}`
    consoleArgs.push(logTypesStyles[logType])
  }
  if (storeName) {
    tpl += `%c${storeName}`
    consoleArgs.push(styles.storeName)
  }
  if (value) {
    tpl += ` →`
    consoleArgs.push(value)
  }
  console.groupCollapsed(tpl, ...consoleArgs)
  cb()
  console.groupEnd()
}

let log = ({ actionName, changed, newValue, oldValue, message }) => {
  if (actionName) {
    console.log('%caction', styles.action, actionName)
  }
  if (changed) {
    console.log('%cchanged', styles.changed, changed)
  }
  if (newValue) {
    console.log('%cnew', styles.new, newValue)
  }
  if (oldValue) {
    console.log('%cold', styles.old, oldValue)
  }
  if (message) {
    console.log(`%c${message}`, styles.message)
  }
}

let handleSet = (storeName, store) =>
  onSet(store, ({ changed, newValue }) => {
    let actionName = store[lastAction]
    group(
      () => {
        log({ actionName, changed, newValue, oldValue: store.get() })
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
      { logType: 'create', storeName }
    )
    return () => {
      group(
        () => {
          log({ message: 'Store was unmounted' })
        },
        { logType: 'stop', storeName }
      )
    }
  })

let storeLogger = (storeName, store) => {
  group(
    () => {
      log({ message: `Logger was connected to ${storeName}` })
    },
    { logType: 'start', storeName }
  )
  let unsubs = [handleSet(storeName, store), handleMount(storeName, store)]
  return () => unsubs.map(fn => fn())
}

let templateLogger = (templateName, template) =>
  onBuild(template, ({ store }) => {
    let unsubLog = storeLogger(`${templateName}-${store.get().id}`, store)
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
