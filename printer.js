import { styles, logTypesStyles } from './constants.js'
import { BadgeLogger } from './badge-logger.js'

const badgeLogger = new BadgeLogger(
  'https://nanostores.github.io/nanostores/logo.svg'
)

let createGroupLogs = ({
  actionName,
  newValue,
  oldValue,
  changed,
  message,
  logType
}) => {
  let tpl = `%c `
  let consoleArgs = [styles.logo]
  if (logType) {
    tpl += `%c${logType}`
    consoleArgs.push(logTypesStyles[logType] + 'border-radius: 99px 0 0 99px;')
  }
  if (actionName) {
    badgeLogger.log(tpl + '%caction', ...consoleArgs, styles.action, actionName)
  }
  if (changed) {
    badgeLogger.log(tpl + '%ckey', ...consoleArgs, styles.key, changed)
  }
  if (newValue) {
    badgeLogger.log(tpl + '%cnew', ...consoleArgs, styles.new, newValue)
  }
  if (oldValue) {
    badgeLogger.log(tpl + '%cold', ...consoleArgs, styles.old, oldValue)
  }
  if (message) {
    badgeLogger.log(`%c${message}`, styles.text)
  }
}

export let log = ({ logType, storeName, message, group }) => {
  let tpl = `%c `
  let consoleArgs = [styles.logo]
  if (logType) {
    tpl += `%c${logType}`
    consoleArgs.push(logTypesStyles[logType])
  }
  if (storeName) {
    tpl += `%c${storeName}`
    consoleArgs.push(styles.store)
  }
  if (message) {
    if (Array.isArray(message)) {
      message.forEach(item => {
        tpl += ` %c${item[1]}`
        consoleArgs.push(styles[item[0]])
      })
    } else {
      tpl += ` %c${message}`
      consoleArgs.push(styles.text)
    }
  }
  if (group) {
    badgeLogger.groupCollapsed(tpl, ...consoleArgs)
    createGroupLogs({ ...group, logType })
    badgeLogger.groupEnd()
  } else {
    badgeLogger.log(tpl, ...consoleArgs)
  }
}
