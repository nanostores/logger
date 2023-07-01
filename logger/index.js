import { actionId, onAction, onMount, onNotify, onSet } from 'nanostores'

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
    action: badge('#5351A4'),
    arguments: badge('#429BD7'),
    change: badge('#0E8A00'),
    error: badge('#c21f1f'),
    mount: badge('#1F49E0'),
    new: badge('#4FA574'),
    old: badge('#a44f4f'),
    unmount: badge('#5C5C5C'),
    value: badge('#429BD7')
  },
  bold: 'font-weight: 700',
  logo: `
    padding: 0 5px 2px;
    color: white;
    background-color: black;
    border-radius: 4px 0 0 4px;
  `,
  text: 'font-weight: 400'
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
          ['text', 'store was mounted']
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
            ['text', 'store was unmounted']
          ],
          type: 'unmount'
        })
      }
    }
  })
}

function handleAction(store, storeName, queue) {
  return onAction(store, ({ actionName, args, id, onEnd, onError }) => {
    queue[id] = []

    let message = [
      ['bold', storeName],
      ['text', 'store was changed by action'],
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
      message.push(['text', 'with arguments'])
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
            ['text', 'store handled error in action'],
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

function handleSet(store, storeName, queue) {
  return onSet(store, ({ changed }) => {
    let currentActionId = store[actionId]

    let groupLog = {
      logo: typeof currentActionId === 'undefined',
      message: [
        ['bold', storeName],
        ['text', 'store was changed']
      ],
      type: 'change'
    }
    if (changed) {
      groupLog.message.push(
        ['text', 'in the'],
        ['bold', changed],
        ['text', 'key']
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
  let messages = opts.message || {}
  let unbind = []
  let queue = {}

  if (messages.mount !== false || messages.unmount !== false) {
    unbind.push(handleMount(store, storeName, messages))
  }

  if (messages.action !== false) {
    unbind.push(handleAction(store, storeName, queue))
  }

  if (messages.change !== false) {
    unbind.push(handleSet(store, storeName, queue))
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
