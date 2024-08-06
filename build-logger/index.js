import { getPath, onMount, onNotify, onSet } from 'nanostores'

import { lastActionId, lastActionName, onAction } from '../action/index.js'

const isAtom = store => store.setKey === undefined
const isPrimitive = value => value !== Object(value) || value === null
const clone = value => {
  try {
    return structuredClone(value)
  } catch {
    return { ...value }
  }
}

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

function handleSet(store, storeName, messages, ignoreActions, events) {
  return onSet(store, () => {
    let currentActionId = store[lastActionId]
    let currentActionName = store[lastActionName]

    if (messages.action === false && currentActionId) return
    if (ignoreActions.includes(currentActionName)) return

    let oldValue = clone(store.value)

    let unbindNotify = onNotify(store, ({ changed }) => {
      let newValue = clone(store.value)

      let valueMessage
      if (isAtom(store)) {
        if (isPrimitive(newValue) && isPrimitive(oldValue)) {
          valueMessage = `${oldValue} → ${newValue}`
          oldValue = undefined
          newValue = undefined
        }
      } else if (changed) {
        let oldPrimitiveValue = getPath(oldValue, changed)
        let newPrimitiveValue = getPath(newValue, changed)
        if (isPrimitive(oldPrimitiveValue) && isPrimitive(newPrimitiveValue)) {
          valueMessage = `${oldPrimitiveValue} → ${newPrimitiveValue}`
        }
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

function handleAction(store, storeName, ignoreActions, events) {
  return onAction(store, ({ actionName, args, id, onEnd, onError }) => {
    if (ignoreActions.includes(actionName)) return

    events.action.start({ actionId: id, actionName, args, storeName })

    onError(({ error }) => {
      events.action.error({ actionId: id, actionName, error, storeName })
    })

    onEnd(() => {
      events.action.end({ actionId: id, actionName, storeName })
    })
  })
}

export function buildLogger(store, storeName, events, opts = {}) {
  let ignoreActions = opts.ignoreActions || []
  let messages = opts.messages || {}
  let unbind = []

  if (messages.mount !== false || messages.unmount !== false) {
    unbind.push(handleMount(store, storeName, messages, events))
  }

  if (messages.change !== false) {
    unbind.push(handleSet(store, storeName, messages, ignoreActions, events))
  }

  if (messages.action !== false) {
    unbind.push(handleAction(store, storeName, ignoreActions, events))
  }

  return () => {
    for (let i of unbind) i()
  }
}
