let printStyles = (background, halfRadius = false) =>
  `font-family:Menlo,monospace;font-weight:normal;padding:0 5px;color:white;background-color:${background};border-radius:${
    halfRadius ? '0 99px 99px 0' : '99px'
  };`

export let styles = {
  badge: ({ badge }) =>
    `font-family:Menlo,monospace;background-image:url("${badge}");background-size:cover;color:white;padding:0 3.25px;margin-right:4px;`,
  new: printStyles('#4FA574', true),
  old: printStyles('#4FA574', true),
  action: printStyles('#5351A4', true),
  changed: printStyles('#429BD7', true),
  text: 'font-family:Menlo,monospace;font-weight:normal;',
  bold: 'font-family:Menlo,monospace;font-weight:bold;',
  store: `font-family:Menlo,monospace;font-weight:bold;margin-left:10px;`
}

export let logTypesStyles = {
  mount: printStyles('#1F49E0'),
  build: printStyles('#BB5100'),
  change: printStyles('#0E8A00'),
  unmount: printStyles('#C74777')
}
