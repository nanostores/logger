import { buildLogger } from '../build-logger/index.js'
import { group, groupEnd, log } from '../printer/index.js'

function createLogger(store, storeName, opts) {
  return buildLogger(
    store,
    storeName,
    {
      change: ({ changed, newValue, oldValue, valueMessage }) => {
        let groupLog = {
          logo: true,
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
      },

      mount: () => {
        log({
          logo: true,
          message: [
            ['bold', storeName],
            ['regular', 'store was mounted']
          ],
          type: 'mount'
        })
      },

      unmount: () => {
        log({
          logo: true,
          message: [
            ['bold', storeName],
            ['regular', 'store was unmounted']
          ],
          type: 'unmount'
        })
      }
    },
    opts
  )
}

export function logger(stores, opts = {}) {
  let unbind = Object.entries(stores).map(([storeName, store]) =>
    createLogger(store, storeName, opts)
  )
  return () => {
    for (let i of unbind) i()
  }
}
