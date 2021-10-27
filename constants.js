let printStyles = (background, halfRadius = false) =>
  `font-family:Menlo,monospace;padding:0 5px;color:white;background-color:${background};border-radius:${
    halfRadius ? '0 99px 99px 0' : '99px'
  };`

export let styles = {
  bage: ({ bage }) =>
    `background-image: url("${bage}");background-size: cover;color:white;padding: 0 3.5px;margin-right: 4px`,
  new: printStyles('#1da1f2', true),
  old: printStyles('#1da1f2', true),
  action: printStyles('indigo', true),
  changed: printStyles('MidnightBlue', true),
  message:
    'border-radius:10px;font-family:Menlo,monospace;margin-left:4px;padding:0 5px;',
  storeName:
    'border-radius:10px;font-family:Menlo,monospace;margin-left:4px;padding:0 5px;'
}

export let logTypesStyles = {
  mount: printStyles('blue'),
  build: printStyles('#8f1fff'),
  change: printStyles('green'),
  unmount: printStyles('tomato')
}
