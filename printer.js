import { styles, logTypesStyles } from './constants.js'
import { BadgeLogger } from './badge-logger.js'

const badgeLogger = new BadgeLogger(
  'https://nanostores.github.io/nanostores/logo.svg'
)

let createLog = ({ logType, storeName, message }) => {
  let tpl = `%c `
  let args = [styles.logo]
  if (logType) {
    tpl += `%c${logType}`
    args.push(logTypesStyles[logType])
  }
  if (storeName) {
    tpl += `%c${storeName}`
    args.push(styles.store)
  }
  if (message) {
    if (Array.isArray(message)) {
      message.forEach(([type, text]) => {
        tpl += `%c ${text}`
        args.push(styles[type])
      })
    } else {
      tpl += `%c ${message}`
      args.push(styles.text)
    }
  }
  return { tpl, args }
}

export let log = ({ logType, storeName, message }) => {
  let { tpl, args } = createLog({ logType, storeName, message })
  badgeLogger.log(tpl, ...args)
}

export let group = ({ logType, storeName, message }, cb) => {
  let { tpl, args } = createLog({ logType, storeName, message })
  badgeLogger.groupCollapsed(tpl, ...args)
  cb()
  badgeLogger.groupEnd()
}

export let nested = ({
  actionName,
  newValue,
  oldValue,
  changed,
  message,
  logType
}) => {
  let tpl = `%c `
  let args = [styles.logo]
  if (logType) {
    tpl += `%c${logType}`
    args.push(logTypesStyles[logType] + 'border-radius: 99px 0 0 99px;')
  }
  if (actionName) {
    badgeLogger.log(tpl + '%caction', ...args, styles.action, actionName)
  }
  if (changed) {
    badgeLogger.log(tpl + '%ckey', ...args, styles.key, changed)
  }
  if (newValue) {
    badgeLogger.log(tpl + '%cnew', ...args, styles.new, newValue)
  }
  if (oldValue) {
    badgeLogger.log(tpl + '%cold', ...args, styles.old, oldValue)
  }
  if (message) {
    badgeLogger.log(`%c${message}`, styles.text)
  }
}
