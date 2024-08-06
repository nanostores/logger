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
    arguments: badge('#007281'),
    build: badge('#BB5100'),
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

  if (typeof type === 'string') {
    template += `%c${type}`
    args.push(STYLES.badges[type] + borders(!logo))
  } else if (typeof type === 'object') {
    template += `%c${type.name.toLowerCase()}`
    args.push(badge(type.color) + borders(!logo))
  }

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

export const log = args => console.log(...createLog(args))
export const group = args => console.groupCollapsed(...createLog(args))
export const groupEnd = () => console.groupEnd()
