import { styles, logTypesStyles } from './constants.js'
import { BageLogger } from './bage-logger.js'

const bageLogger = new BageLogger(
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
  bageLogger.groupCollapsed(tpl, ...consoleArgs)
  cb()
  bageLogger.groupEnd()
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
    bageLogger.log(tpl + '%caction', ...consoleArgs, styles.action, actionName)
  }
  if (changed) {
    bageLogger.log(tpl + '%ckey', ...consoleArgs, styles.changed, changed)
  }
  if (newValue) {
    bageLogger.log(tpl + '%cnew', ...consoleArgs, styles.new, newValue)
  }
  if (oldValue) {
    bageLogger.log(tpl + '%cold', ...consoleArgs, styles.old, oldValue)
  }
  if (message) {
    bageLogger.log(`%c${message}`, styles.message)
  }
}
