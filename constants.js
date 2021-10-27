let text = (bold = false) =>
  `font-family:Menlo,monospace;font-weight:${bold ? 'bold' : 'normal'}`

let badge = (background, halfRadius = false) =>
  `${text()}padding:0 5px;color:white;background-color:${background};border-radius:${
    halfRadius ? '0 99px 99px 0' : '99px'
  };`

export let styles = {
  logo: ({ url }) =>
    `font-family:Menlo,monospace;background-image:url("${url}");background-size:cover;color:white;padding:0 3.25px;margin-right:4px;`,
  new: badge('#4FA574', true),
  old: badge('#4FA574', true),
  action: badge('#5351A4', true),
  key: badge('#429BD7', true),
  text: text(),
  bold: text(true),
  store: `${text(true)}margin-left:10px;`
}

export let logTypesStyles = {
  mount: badge('#1F49E0'),
  build: badge('#BB5100'),
  change: badge('#0E8A00'),
  unmount: badge('#C74777')
}
