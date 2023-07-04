import {
  actionId,
  lastAction,
  onAction,
  onMount,
  onNotify,
  onSet
} from 'nanostores'

const isAtom = store => store.setKey === undefined
const isDeepMapKey = key => /.+(\..+|\[\d+\.*])/.test(key)

function handleMount(store, storeName, messages, events) {
  return onMount(store, () => {
    if (messages.mount !== false) {
      events.mount({ storeName })
    }
    return () => {
      if (messages.unmount !== false) {
        events.unmount({ storeName })
      }
    }
  })
}

function handleAction(store, storeName, ignoreActions, events) {
  return onAction(store, ({ actionName, args, id, onEnd, onError }) => {
    if (ignoreActions && ignoreActions.includes(actionName)) return

    events.action.start({ actionId: id, actionName, args, storeName })

    onError(({ error }) => {
      events.action.error({ actionId: id, actionName, error, storeName })
    })

    onEnd(() => {
      events.action.end({ actionId: id, actionName, storeName })
    })
  })
}

function handleSet(store, storeName, messages, ignoreActions, events) {
  return onSet(store, ({ changed }) => {
    let currentActionId = store[actionId]
    let currentActionName = store[lastAction]

    if (messages.action === false && currentActionId) return
    if (ignoreActions && ignoreActions.includes(currentActionName)) return

    let oldValue = isAtom(store) ? store.value : { ...store.value }
    oldValue = isDeepMapKey(changed) ? structuredClone(oldValue) : oldValue
    let unbindNotify = onNotify(store, () => {
      let newValue = store.value
      let valueMessage
      if (changed && !isDeepMapKey(changed)) {
        valueMessage = `${oldValue[changed]} → ${newValue[changed]}`
      }

      events.change({
        actionId: currentActionId,
        actionName: currentActionName,
        changed,
        newValue,
        oldValue,
        storeName,
        valueMessage
      })

      unbindNotify()
    })
  })
}

export function buildLogger(store, storeName, events, opts = {}) {
  let ignoreActions = opts.ignoreActions
  let messages = opts.messages || {}
  let unbind = []

  if (messages.mount !== false || messages.unmount !== false) {
    unbind.push(handleMount(store, storeName, messages, events))
  }

  if (messages.action !== false) {
    unbind.push(handleAction(store, storeName, ignoreActions, events))
  }

  if (messages.change !== false) {
    unbind.push(handleSet(store, storeName, messages, ignoreActions, events))
  }

  return () => {
    for (let i of unbind) i()
  }
}
