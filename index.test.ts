import { action, atom, map, mapTemplate } from 'nanostores'
import { jest } from '@jest/globals'
import { SpyInstance } from 'jest-mock'
import { delay } from 'nanodelay'

import { logger } from './index.js'

let atomStore = atom({ value: 0 })
let mapStore = map({ value: 0, id: '1' })
let TemplateStore = mapTemplate<{ value: number }>(s => {
  s.set({ value: 0, id: '1' })
})

describe('Logger', () => {
  let consoleGroupCollapsedMock: SpyInstance<void, any[]>
  let consoleLogMock: SpyInstance<
    void,
    [message?: any, ...optionalParams: any[]]
  >
  let consoleGroupEndMock: SpyInstance<void, any[]>

  beforeEach(() => {
    consoleGroupCollapsedMock = jest
      .spyOn(console, 'groupCollapsed')
      .mockImplementation(() => {})
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleGroupEndMock = jest
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    consoleGroupCollapsedMock.mockRestore()
    consoleLogMock.mockRestore()
    consoleGroupEndMock.mockRestore()
  })

  describe.each([
    [atomStore, 'atomStore'],
    [mapStore, 'mapStore'],
    [TemplateStore('1'), 'TemplateStore-1']
  ])('Base log types', (store, storeName) => {
    it(`${storeName}: connected`, () => {
      let unbind = logger({ [storeName]: store })

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cstart%c${storeName}`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:blue;',
        'padding-left:4px;padding-right:4px;font-weight:normal;'
      )

      expect(console.log).toHaveBeenLastCalledWith(
        `%cLogger was connected to ${storeName}`,
        'padding-left:4px;padding-right:4px;font-weight:normal;'
      )

      expect(consoleGroupCollapsedMock).toHaveBeenCalledTimes(1)
      expect(consoleLogMock).toHaveBeenCalledTimes(1)
      expect(consoleGroupEndMock).toHaveBeenCalledTimes(1)

      unbind()
    })

    it(`${storeName}: mount/unmount`, async () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %ccreate%c${storeName}`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:#8f1fff;',
        'padding-left:4px;padding-right:4px;font-weight:normal;'
      )

      expect(console.log).toHaveBeenLastCalledWith(
        '%cStore was mounted',
        'padding-left:4px;padding-right:4px;font-weight:normal;'
      )

      unbindStore()

      await delay(1020)

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cstop%c${storeName}`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
        'padding-left:4px;padding-right:4px;font-weight:normal;'
      )

      expect(console.log).toHaveBeenLastCalledWith(
        '%cStore was unmounted',
        'padding-left:4px;padding-right:4px;font-weight:normal;'
      )

      expect(consoleGroupCollapsedMock).toHaveBeenCalledTimes(3)
      expect(consoleLogMock).toHaveBeenCalledTimes(3)
      expect(consoleGroupEndMock).toHaveBeenCalledTimes(3)

      unbind()
    })
  })

  describe('Atom changes', () => {
    let [store, storeName] = [atomStore, 'atomStore']

    it(`${storeName}: change`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      store.set({ value: 2 })

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { value: 2 }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          `%cLogger was connected to ${storeName}`,
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%cStore was mounted',
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 2 }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 0 }
        ]
      ])

      unbindStore()
      unbind()
    })

    it(`${storeName}: change with old`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      store.set({ value: 2 })
      store.set({ value: 3 })

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { value: 3 }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          '%cLogger was connected to atomStore',
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 2 }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 2 }
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 3 }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 2 }
        ]
      ])

      unbindStore()
      unbind()
    })

    it(`${storeName}: change with action`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      let myAction = action(store, 'myAction', s => {
        s.set({ value: 44 })
      })
      myAction()
      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { value: 44 }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          '%cLogger was connected to atomStore',
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%caction',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:indigo;',
          'myAction'
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 44 }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 3 }
        ]
      ])

      unbindStore()
      unbind()
    })
  })

  describe.each([
    [mapStore, 'mapStore'],
    [
      (() => {
        let TemplateStore2 = mapTemplate<{ value: number }>(s => {
          s.set({ value: 0, id: '1' })
        })
        let store = TemplateStore2('1')
        //@ts-ignore
        store.value = { ...store.value, value: 0 }
        return store
      })(),
      'TemplateStore-1'
    ]
  ])('Map changes', (store, storeName) => {
    it(`${storeName}: change`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      store.set({ value: 2, id: '1' })

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { value: 2, id: '1' }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          `%cLogger was connected to ${storeName}`,
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%cStore was mounted',
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 2, id: '1' }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 0, id: '1' }
        ]
      ])

      unbindStore()
      unbind()
    })

    it(`${storeName}: change with old`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      store.set({ value: 2, id: '1' })
      store.set({ value: 3, id: '1' })

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { value: 3, id: '1' }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          `%cLogger was connected to ${storeName}`,
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],

        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 2, id: '1' }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 2, id: '1' }
        ],

        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 3, id: '1' }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 2, id: '1' }
        ]
      ])

      unbindStore()
      unbind()
    })

    it(`${storeName}: change with action`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      let myAction = action(store, 'myAction', s => {
        s.set({ id: '1', value: 44 })
      })
      myAction()
      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { id: '1', value: 44 }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          `%cLogger was connected to ${storeName}`,
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%caction',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:indigo;',
          'myAction'
        ],

        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { id: '1', value: 44 }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { id: '1', value: 3 }
        ]
      ])

      unbindStore()
      unbind()
    })

    it(`${storeName}: setKey`, () => {
      let unbind = logger({ [storeName]: store })
      let unbindStore = store.listen(() => {})
      store.setKey('value', 2)
      store.setKey('value', 3)

      expect(console.groupCollapsed).toHaveBeenLastCalledWith(
        `%c %cchange%c${storeName} →`,
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
        'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
        'padding-left:4px;padding-right:4px;font-weight:normal;',
        { value: 3, id: '1' }
      )

      expect(consoleLogMock.mock.calls).toEqual([
        [
          `%cLogger was connected to ${storeName}`,
          'padding-left:4px;padding-right:4px;font-weight:normal;'
        ],
        [
          '%cchanged',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:MidnightBlue;',
          'value'
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 2, id: '1' }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 44, id: '1' }
        ],
        [
          '%cchanged',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:MidnightBlue;',
          'value'
        ],
        [
          '%cnew',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
          { value: 3, id: '1' }
        ],
        [
          '%cold',
          'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;',
          { value: 2, id: '1' }
        ]
      ])

      unbindStore()
      unbind()
    })
  })

  it('Template onBuild', () => {
    let LocalTemplate = mapTemplate()
    let unbind = logger({ store: LocalTemplate })
    let store = LocalTemplate('2')
    let unsub = store.listen(() => {})
    expect(console.groupCollapsed).toHaveBeenLastCalledWith(
      `%c %cstart%cstore-2`,
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:blue;',
      'padding-left:4px;padding-right:4px;font-weight:normal;'
    )

    expect(console.log).toHaveBeenLastCalledWith(
      `%cLogger was connected to store-2`,
      'padding-left:4px;padding-right:4px;font-weight:normal;'
    )

    expect(consoleGroupCollapsedMock).toHaveBeenCalledTimes(1)
    expect(consoleLogMock).toHaveBeenCalledTimes(1)
    expect(consoleGroupEndMock).toHaveBeenCalledTimes(1)

    unbind()
    unsub()
  })
})
