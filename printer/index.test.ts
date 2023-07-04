import { afterEach, beforeAll, expect, it, vi } from 'vitest'

import { format } from '../test/index.js'
import { group, groupEnd, log } from './index.js'

let out = ''
let groups = 0

beforeAll(() => {
  vi.spyOn(console, 'groupCollapsed').mockImplementation((...args: any[]) => {
    console.log(...args)
    groups += 1
  })
  vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    if (out === '') out += '\n'
    out += format(groups, ['fetch'], ...args) + '\n'
  })
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {
    groups -= 1
  })
})

afterEach(() => {
  out = ''
  groups = 0
})

it('prints custom logs', () => {
  let FETCH_TYPE = {
    color: '#510080',
    name: 'fetch'
  }

  group({
    logo: true,
    message: [
      ['bold', 'Profile'],
      ['regular', 'store is trying to get new values']
    ],
    type: FETCH_TYPE
  })
  log({
    message: [
      ['bold', 'Profile'],
      ['regular', 'store received new values']
    ],
    type: FETCH_TYPE
  })
  groupEnd()

  expect(out).toMatchSnapshot()
})
