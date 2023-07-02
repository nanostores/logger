import {
  actionId,
  lastAction,
  onAction,
  onMount,
  onNotify,
  onSet
} from 'nanostores'

function badge(color) {
  return `
    padding: 0 5px 2px;
    margin-right: 5px;
    font-weight: 400;
    color: white;
    background-color: ${color};
  `
}

function borders(full) {
  return `border-radius: ${full ? '4px' : '0 4px 4px 0'};`
}

const STYLES = {
  badges: {
    action: badge('#00899A'),
    arguments: badge('#007281'),
    change: badge('#0E8A00'),
    error: badge('#C30000'),
    mount: badge('#0059D1'),
    new: badge('#0C7800'),
    old: badge('#943636'),
    unmount: badge('#5E5E5E'),
    value: badge('#8A6F00')
  },
  bold: 'font-weight: 700;',
  logo: `
    padding: 0 5px 2px;
    color: white;
    background-color: black;
    border-radius: 4px 0 0 4px;
  `,
  regular: 'font-weight: 400;'
}

function createLog({ logo, message, type, value }) {
  let template = ''
  let args = []

  if (logo) {
    template = `%c𝖓`
    args.push(STYLES.logo)
  }

  template += `%c${type}`
  args.push(STYLES.badges[type] + borders(!logo))

  if (message) {
    if (Array.isArray(message)) {
      message.forEach(([style, text]) => {
        template += `%c ${text}`
        args.push(STYLES[style])
      })
    } else {
      template += `%c ${message}`
      args.push(STYLES.text)
    }
  }

  if (value) {
    args.push(value)
  }

  args.unshift(template)

  return args
}

const log = args => console.log(...createLog(args))
const group = args => console.groupCollapsed(...createLog(args))
const groupEnd = () => console.groupEnd()

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
