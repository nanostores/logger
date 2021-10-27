import { styles, logTypesStyles } from './constants.js'
import { BadgeLogger } from './badge-logger.jss'

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
  let consoleArgs = [styles.badge]
  if (logType) {
    tpl += `%c${logType}`
    consoleArgs.push(logTypesStyles[logType] + 'border-radius: 99px 0 0 99px;')
  }
  if (actionName) {
    badgeLogger.log(tpl + '%caction', ...consoleArgs, styles.action, actionName)
  }
  if (changed) {
    badgeLogger.log(tpl + '%ckey', ...consoleArgs, styles.changed, changed)
  }
  if (newValue) {
    badgeLogger.log(tpl + '%cnew', ...consoleArgs, styles.new, newValue)
  }
  if (oldValue) {
    badgeLogger.log(tpl + '%cold', ...consoleArgs, styles.old, oldValue)
  }
  if (message) {
    badgeLogger.log(`%c${message}`, styles.message)
  }
}

export let log = ({ logType, storeName, value, message, group }) => {
  let tpl = `%c `
  let consoleArgs = [styles.badge]
  if (logType) {
    tpl += `%c${logType}`
    consoleArgs.push(logTypesStyles[logType])
  }
  if (storeName) {
    tpl += `%c${storeName}`
    consoleArgs.push(styles.storeName)
  }
  if (value) {
    tpl += ` →`
    consoleArgs.push(value)
  }
  if (message) {
    tpl += message
  }
  if (group) {
    badgeLogger.groupCollapsed(tpl, ...consoleArgs)
    createGroupLogs({ ...data, logType })
    badgeLogger.groupEnd()
  } else {
    badgeLogger.log(tpl, ...consoleArgs)
  }
}
