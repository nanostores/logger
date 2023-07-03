import { logger } from '../logger/index.js'
import { log } from '../printer/index.js'

function onBuild(template, listener) {
  let originBuild = template.build
  template.build = (...args) => {
    let store = originBuild(...args)
    listener(store)
    return store
  }
  return () => {
    template.build = originBuild
  }
}

function createCreatorLogger(template, templateName, opts) {
  let unbind = []
  unbind.push(
    onBuild(template, store => {
      let storeName = opts.nameGetter(templateName, store)

      log({
        logo: true,
        message: [
          ['bold', storeName],
          ['regular', 'store was built by'],
          ['bold', templateName],
          ['regular', 'creator']
        ],
        type: 'mount'
      })

      unbind.push(
        logger({
          [storeName]: store
        })
      )
    })
  )

  return () => {
    for (let i of unbind) i()
  }
}

const defaultNameGetter = (templateName, store) => {
  return `${templateName}:${store.value.id}`
}

export function creatorLogger(templates, opts = {}) {
  opts = {
    nameGetter: defaultNameGetter,
    ...opts
  }
  let unbind = Object.entries(templates).map(([templateName, template]) =>
    createCreatorLogger(template, templateName, opts)
  )
  return () => {
    for (let i of unbind) i()
  }
}
