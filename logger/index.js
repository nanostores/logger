import {
  actionId,
  lastAction,
  onAction,
  onMount,
  onNotify,
  onSet
} from 'nanostores'

import { group, groupEnd, log } from '../printer/index.js'

const isAtom = store => store.setKey === undefined
const isDeepMapKey = key => /.+(\..+|\[\d+\.*])/.test(key)

function handleMount(store, storeName, messages) {
  return onMount(store, () => {
    if (messages.mount !== false) {
      log({
        logo: true,
        message: [
          ['bold', storeName],
          ['regular', 'store was mounted']
        ],
        type: 'mount'
      })
    }
    return () => {
      if (messages.unmount !== false) {
        log({
          logo: true,
          message: [
            ['bold', storeName],
            ['regular', 'store was unmounted']
          ],
          type: 'unmount'
        })
      }
    }
  })
}

function handleAction(store, storeName, queue, ignoreActions) {
  return onAction(store, ({ actionName, args, id, onEnd, onError }) => {
    if (ignoreActions && ignoreActions.includes(actionName)) return

    queue[id] = []

    let message = [
      ['bold', storeName],
      ['regular', 'store was changed by action'],
      ['bold', actionName]
    ]

    queue[id].push(() =>
      group({
        logo: true,
        message,
        type: 'action'
      })
    )
    if (args.length > 0) {
      message.push(['regular', 'with arguments'])
      queue[id].push(() =>
        log({
          type: 'arguments',
          value: args
        })
      )
    }

    onError(({ error }) => {
      queue[id].push(() =>
        log({
          message: [
            ['bold', storeName],
            ['regular', 'store handled error in action'],
            ['bold', actionName]
          ],
          type: 'error',
          value: {
            message: error.message
          }
        })
      )
    })

    onEnd(() => {
      for (let i of queue[id]) i()
      delete queue[id]
      groupEnd()
    })
  })
}

function handleSet(store, storeName, queue, messages, ignoreActions) {
  return onSet(store, ({ changed }) => {
    let currentActionId = store[actionId]
    let currentActionName = store[lastAction]

    if (messages.action === false && currentActionId) return
    if (ignoreActions && ignoreActions.includes(currentActionName)) return

    let groupLog = {
      logo: typeof currentActionId === 'undefined',
      message: [
        ['bold', storeName],
        ['regular', 'store was changed']
      ],
      type: 'change'
    }
    if (changed) {
      groupLog.message.push(
        ['regular', 'in the'],
        ['bold', changed],
        ['regular', 'key']
      )
    }

    let oldValue = isAtom(store) ? store.value : { ...store.value }
    oldValue = isDeepMapKey(changed) ? structuredClone(oldValue) : oldValue
    let unbindNotify = onNotify(store, () => {
      let newValue = store.value
      let valueMessage
      if (changed && !isDeepMapKey(changed)) {
        valueMessage = `${oldValue[changed]} → ${newValue[changed]}`
      }

      let run = () => {
        group(groupLog)
        if (valueMessage) {
          log({
            message: valueMessage,
            type: 'value'
          })
        }
        log({
          type: 'new',
          value: newValue
        })
        if (oldValue) {
          log({
            type: 'old',
            value: oldValue
          })
        }
        groupEnd()
      }

      if (currentActionId) {
        queue[currentActionId].push(run)
      } else {
        run()
      }
      unbindNotify()
    })
  })
}

function createLogger(store, storeName, opts) {
  let ignoreActions = opts.ignoreActions
  let messages = opts.messages || {}
  let unbind = []
  let queue = {}

  if (messages.mount !== false || messages.unmount !== false) {
    unbind.push(handleMount(store, storeName, messages))
  }

  if (messages.action !== false) {
    unbind.push(handleAction(store, storeName, queue, ignoreActions))
  }

  if (messages.change !== false) {
    unbind.push(handleSet(store, storeName, queue, messages, ignoreActions))
  }

  return () => {
    for (let i of unbind) i()
  }
}

export function logger(stores, opts = {}) {
  let unbind = Object.entries(stores).map(([storeName, store]) =>
    createLogger(store, storeName, opts)
  )
  return () => {
    for (let i of unbind) i()
  }
}
