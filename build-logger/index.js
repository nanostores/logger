import { onMount, onNotify, onSet } from 'nanostores'

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

function handleSet(store, storeName, events) {
  return onSet(store, ({ changed }) => {
    let oldValue = isAtom(store) ? store.value : { ...store.value }
    oldValue = isDeepMapKey(changed) ? structuredClone(oldValue) : oldValue
    let unbindNotify = onNotify(store, () => {
      let newValue = store.value
      let valueMessage
      if (changed && !isDeepMapKey(changed)) {
        valueMessage = `${oldValue[changed]} → ${newValue[changed]}`
      }

      events.change({
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
  let messages = opts.messages || {}
  let unbind = []

  if (messages.mount !== false || messages.unmount !== false) {
    unbind.push(handleMount(store, storeName, messages, events))
  }

  if (messages.change !== false) {
    unbind.push(handleSet(store, storeName, events))
  }

  return () => {
    for (let i of unbind) i()
  }
}
