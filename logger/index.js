import { actionId, onAction, onMount, onSet } from 'nanostores'

function badge(color) {
  return `
    padding: 0 5px 2px
    margin-right: 5px
    font-weight: 400
    color: white
    background-color: ${color}
  `
}

function borders(full) {
  return `border-radius: ${full ? '4px' : '0 4px 4px 0'}`
}

const STYLES = {
  action: badge('#5351A4'),
  arguments: badge('#429BD7'),
  bold: 'font-weight: 700',
  change: badge('#0E8A00'),
  error: badge('#c21f1f'),
  logo: `
    padding: 0 5px 2px
    color: white
    background-color: black
    border-radius: 4px 0 0 4px
  `,
  mount: badge('#1F49E0'),
  new: badge('#4FA574'),
  old: badge('#a44f4f'),
  text: 'font-weight: 400',
  unmount: badge('#5C5C5C'),
  value: badge('#429BD7')
}

function createLog({ logo, message, type, value }) {
  let template = ''
  let args = []

  if (logo) {
    template = `%c𝖓`
    args.push(STYLES.logo)
  }

  template += `%c${type}`
  args.push(STYLES[type] + borders(!logo))

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

function createLogger(store, storeName) {
  let queue = {}

  let unbindMount = onMount(store, () => {
    log({
      logo: true,
      message: [
        ['bold', storeName],
        ['text', 'was mounted']
      ],
      type: 'mount'
    })
    return () => {
      log({
        logo: true,
        message: [
          ['bold', storeName],
          ['text', 'was unmounted']
        ],
        type: 'unmount'
      })
    }
  })

  let unbindAction = onAction(
    store,
    ({ actionName, args, id, onEnd, onError }) => {
      queue[id] = []

      let message = [
        ['bold', storeName],
        ['text', 'was changed by action'],
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
              ['text', 'handled error in action'],
              ['bold', actionName]
            ],
            type: 'error',
            value: error
          })
        )
      })

      onEnd(() => {
        for (let i of queue[id]) i()
        groupEnd()
      })
    }
  )

  let unbindSet = onSet(store, ({ changed, newValue }) => {
    let currentActionId = store[actionId]

    let groupLog = {
      logo: typeof currentActionId === 'undefined',
      message: [
        ['bold', storeName],
        ['text', 'was changed']
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

    let oldValue = store.value
    let valueMessage = changed
      ? `${oldValue[changed]} → ${newValue[changed]}`
      : 'test'

    let run = () => {
      group(groupLog)
      log({
        message: valueMessage,
        type: 'value'
      })
      log({
        type: 'new',
        value: newValue
      })
      log({
        type: 'old',
        value: oldValue
      })
      groupEnd()
    }

    if (currentActionId) {
      queue[currentActionId].push(run)
    } else {
      run()
    }
  })

  return () => {
    unbindAction()
    unbindMount()
    unbindSet()
  }
}

export function logger(stores) {
  let unbind = Object.entries(stores).map(([storeName, store]) =>
    createLogger(store, storeName)
  )
  return () => {
    for (let i of unbind) i()
  }
}
