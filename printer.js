import { styles, logTypesStyles } from './constants.js'
import { BadgeLogger } from './badge-logger.jss'

const badgeLogger = new BadgeLogger(
  'https://nanostores.github.io/nanostores/logo.svg'
)

export let group = (cb, { logType, storeName, value }) => {
  let tpl = `%c `
  let consoleArgs = [styles.bage]
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
  badgeLogger.groupCollapsed(tpl, ...consoleArgs)
  cb()
  badgeLogger.groupEnd()
}

export let log = ({
  actionName,
  changed,
  newValue,
  oldValue,
  message,
  logType
}) => {
  let tpl = `%c `
  let consoleArgs = [styles.bage]
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
    bageLbadgeLoggerbadgeLoggerogger.log(tpl + '%cnew', ...consoleArgs, styles.new, newValue)
  }
  if (oldValue) {
    badgeLogger.log(tpl + '%cold', ...consoleArgs, styles.old, oldValue)
  }
  if (message) {
    badgeLogger.log(`%c${message}`, styles.message)
  }
}
