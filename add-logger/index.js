import {
  lastAction,
  onAction,
  onSet,
  onStart,
  onStop,
  STORE_UNMOUNT_DELAY
} from 'nanostores'

export function addLogger(store, events) {
  let mounted
  let unbindStart = onStart(store, () => {
    if (!mounted) {
      mounted = true
      events.start()
    }
  })
  let unbindStop = onStop(store, () => {
    setTimeout(() => {
      if (mounted) {
        mounted = false
        events.stop()
      }
    }, STORE_UNMOUNT_DELAY + 10)
  })

  let unbindSet = onSet(store, payload => {
    events.set({
      ...payload,
      actionName: store[lastAction],
      oldValue: store.value
    })
  })

  let unbindAction
  if (events.action) {
    unbindAction = onAction(store, ({ actionName, id, onEnd, onError }) => {
      events.action.start({ actionName, id })
      onError(() => {
        events.action.error({ actionName, id })
      })
      onEnd(() => {
        events.action.end({ actionName, id })
      })
    })
  }

  return () => {
    unbindAction && unbindAction()
    unbindStart()
    unbindStop()
    unbindSet()
  }
}
