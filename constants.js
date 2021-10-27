let printStyles = (background, halfRadius = false) =>
  `font-family:Menlo,monospace;font-weight:normal;padding:0 5px;color:white;background-color:${background};border-radius:${
    halfRadius ? '0 99px 99px 0' : '99px'
  };`

export let styles = {
  badge: ({ badge }) =>
    `background-image: url("${badge}");background-size: cover;color:white;padding: 0 3.5px;margin-right: 4px`,
  new: printStyles('#4FA574', true),
  old: printStyles('#4FA574', true),
  action: printStyles('#5351A4', true),
  changed: printStyles('#429BD7', true),
  message:
    'border-radius:10px;font-family:Menlo,monospace;margin-left:4px;padding:0 5px;',
  storeName:
    'border-radius:10px;font-family:Menlo,monospace;margin-left:4px;padding:0 5px;'
}

export let logTypesStyles = {
  mount: printStyles('#1F49E0'),
  build: printStyles('#BB5100'),
  change: printStyles('#0E8A00'),
  unmount: printStyles('#C74777')
}
