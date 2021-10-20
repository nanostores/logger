/* eslint-disable no-console */
import { action, atom } from 'nanostores'
import { jest } from '@jest/globals'
import { SpyInstance } from 'jest-mock'
import { delay } from 'nanodelay'

import { logger } from './index.js'

describe('Nanostores Logger', () => {
  let consoleGroupCollapsedMock: SpyInstance<void, any[]>
  let consoleLogMock: SpyInstance<
    void,
    [message?: any, ...optionalParams: any[]]
  >
  let consoleGroupEndMock: SpyInstance<void, any[]>

  let atomStore = atom(0)
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

  it('Atom: connected', () => {
    let unbind = logger({ atomStore })

    expect(console.groupCollapsed).toHaveBeenLastCalledWith(
      '%cnanostores%cstart%catomStore',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:blue;',
      'padding-left:4px;padding-right:4px;font-weight:normal;'
    )

    expect(console.log).toHaveBeenLastCalledWith(
      '%cLogger was connected to atomStore',
      'padding-left:4px;padding-right:4px;font-weight:normal;'
    )

    expect(consoleGroupCollapsedMock).toHaveBeenCalledTimes(1)
    expect(consoleLogMock).toHaveBeenCalledTimes(1)
    expect(consoleGroupEndMock).toHaveBeenCalledTimes(1)

    unbind()
  })

  it('Atom: mount/unmount', async () => {
    // expect(console.warn.mock.calls)
    let unbind = logger({ atomStore })
    let unbindStore = atomStore.listen(() => {})

    expect(console.groupCollapsed).toHaveBeenLastCalledWith(
      '%cnanostores%ccreate%catomStore',
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
      '%cnanostores%cstop%catomStore',
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

  it('Atom: change', () => {
    let unbind = logger({ atomStore })
    let unbindStore = atomStore.listen(() => {})
    atomStore.set(2)

    expect(console.groupCollapsed).toHaveBeenLastCalledWith(
      '%cnanostores%cchange%catomStore →',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
      'padding-left:4px;padding-right:4px;font-weight:normal;',
      2
    )

    expect(consoleLogMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "%cLogger was connected to atomStore",
          "padding-left:4px;padding-right:4px;font-weight:normal;",
        ],
        Array [
          "%cStore was mounted",
          "padding-left:4px;padding-right:4px;font-weight:normal;",
        ],
        Array [
          "%cnew",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;",
          2,
        ],
      ]
    `)

    unbindStore()
    unbind()
  })

  it('Atom: change with old', () => {
    let unbind = logger({ atomStore })
    let unbindStore = atomStore.listen(() => {})
    atomStore.set(2)
    atomStore.set(3)

    expect(console.groupCollapsed).toHaveBeenLastCalledWith(
      '%cnanostores%cchange%catomStore →',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
      'padding-left:4px;padding-right:4px;font-weight:normal;',
      3
    )

    expect(consoleLogMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "%cLogger was connected to atomStore",
          "padding-left:4px;padding-right:4px;font-weight:normal;",
        ],
        Array [
          "%cnew",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;",
          2,
        ],
        Array [
          "%cold",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;",
          2,
        ],
        Array [
          "%cnew",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;",
          3,
        ],
        Array [
          "%cold",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;",
          2,
        ],
      ]
    `)

    unbindStore()
    unbind()
  })

  it('Atom: change with action', () => {
    let unbind = logger({ atomStore })
    let unbindStore = atomStore.listen(() => {})
    let myAction = action(atomStore, 'myAction', store => {
      store.set(44)
    })
    myAction()
    expect(console.groupCollapsed).toHaveBeenLastCalledWith(
      '%cnanostores%cchange%catomStore →',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:black;',
      'color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;',
      'padding-left:4px;padding-right:4px;font-weight:normal;',
      44
    )

    expect(consoleLogMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "%cLogger was connected to atomStore",
          "padding-left:4px;padding-right:4px;font-weight:normal;",
        ],
        Array [
          "%caction",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:indigo;",
          "myAction",
        ],
        Array [
          "%cnew",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:green;",
          44,
        ],
        Array [
          "%cold",
          "color:white;padding-left:4px;padding-right:4px;font-weight:normal;background:tomato;",
          3,
        ],
      ]
    `)

    unbindStore()
    unbind()
  })
})
