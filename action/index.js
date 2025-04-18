import { startTask } from 'nanostores'

export let lastActionId = Symbol('last-action-id')
export let lastActionName = Symbol('last-action-name')

let uid = 0
let actionHook = Symbol('action-hook')

export function onAction($store, listener) {
  $store[actionHook] = (id, actionName, args) => {
    let errorListeners = {}
    let endListeners = {}
    listener({
      actionName,
      args,
      id,
      onEnd: l => {
        ;(endListeners[id] || (endListeners[id] = [])).push(l)
      },
      onError: l => {
        ;(errorListeners[id] || (errorListeners[id] = [])).push(l)
      }
    })
    return [
      error => {
        if (errorListeners[id]) {
          for (let l of errorListeners[id]) l({ error })
        }
      },
      () => {
        if (endListeners[id]) {
          for (let l of endListeners[id]) l()
          delete errorListeners[id]
          delete endListeners[id]
        }
      }
    ]
  }

  return () => {
    delete $store[actionHook]
  }
}

export function action($store, actionName, cb) {
  return (...args) => {
    let id = ++uid
    let tracker = { ...$store }
    tracker.set = (...setArgs) => {
      $store[lastActionName] = actionName
      $store[lastActionId] = id
      $store.set(...setArgs)
      delete $store[lastActionName]
      delete $store[lastActionId]
    }
    if ($store.setKey) {
      tracker.setKey = (...setArgs) => {
        $store[lastActionName] = actionName
        $store[lastActionId] = id
        $store.setKey(...setArgs)
        delete $store[lastActionName]
        delete $store[lastActionId]
      }
    }
    let onEnd, onError
    if ($store[actionHook]) {
      ;[onError, onEnd] = $store[actionHook](id, actionName, args)
    }
    let result = cb(tracker, ...args)
    if (result instanceof Promise) {
      let endTask = startTask()
      return result
        .catch(error => {
          if (onError) onError(error)
          throw error
        })
        .finally(() => {
          endTask()
          if (onEnd) onEnd()
        })
    }
    if (onEnd) onEnd()
    return result
  }
}
