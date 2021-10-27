import { atom } from 'nanostores'

const toDataURL = url =>
  new Promise(resolve => {
    let xhr = new XMLHttpRequest()
    xhr.onload = function () {
      let reader = new FileReader()
      reader.onloadend = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  })

export class BageLogger {
  constructor(src, template, shared = {}) {
    this.template = template
    this.shared = shared
    let bageLoader = (async () => {
      let dataUrl = await toDataURL(src)
      shared.bage = dataUrl
    })()
    this.queue = atom([])
    this.queue.push = function (v) {
      this.set([...this.get(), v])
    }
    this.queue.clear = function () {
      this.set([])
    }
    bageLoader.then(() => {
      this.queue.subscribe(messages => {
        if (!messages.length) return
        messages.forEach(({ type, content = [] }) => {
          console[type](
            ...content.map(d => (typeof d === 'function' ? d(this.shared) : d))
          )
        })
        this.queue.clear()
      })
    })
  }

  log(...args) {
    this.queue.push({
      type: 'log',
      content: args
    })
  }

  groupCollapsed(...args) {
    this.queue.push({
      type: 'groupCollapsed',
      content: args
    })
  }

  groupEnd(...args) {
    this.queue.push({ type: 'groupEnd', content: args })
  }
}
