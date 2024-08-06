import { buildLogger } from '../build-logger/index.js'
import { group, groupEnd, log } from '../printer/index.js'

function createLogger(store, storeName, opts) {
  let queue = {}

  return buildLogger(
    store,
    storeName,
    {
      action: {
        end: ({ actionId }) => {
          for (let i of queue[actionId]) i()
          delete queue[actionId]
          groupEnd()
        },

        error: ({ actionId, actionName, error }) => {
          queue[actionId].push(() =>
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
        },

        start: ({ actionId, actionName, args }) => {
          queue[actionId] = []

          let message = [
            ['bold', storeName],
            ['regular', 'store was changed by action'],
            ['bold', actionName]
          ]

          queue[actionId].push(() =>
            group({
              logo: true,
              message,
              type: 'action'
            })
          )
          if (args.length > 0) {
            message.push(['regular', 'with arguments'])
            queue[actionId].push(() =>
              log({
                type: 'arguments',
                value: args
              })
            )
          }
        }
      },

      change: ({ actionId, changed, newValue, oldValue, valueMessage }) => {
        let groupLog = {
          logo: typeof actionId === 'undefined',
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

        let run = () => {
          group(groupLog)
          if (valueMessage) {
            log({
              message: valueMessage,
              type: 'value'
            })
          }
          if (newValue) {
            log({
              type: 'new',
              value: newValue
            })
          }
          if (oldValue) {
            log({
              type: 'old',
              value: oldValue
            })
          }
          groupEnd()
        }

        if (actionId) {
          queue[actionId].push(run)
        } else {
          run()
        }
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
