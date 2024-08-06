import { delay } from 'nanodelay'
import type { MapCreator, MapStore } from 'nanostores'
import { map, onMount, STORE_UNMOUNT_DELAY } from 'nanostores'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'

import { action } from '../action/index.js'
import { format } from '../test/index.js'
import { creatorLogger } from './index.js'

function createMapCreator(
  init?: (store: MapStore, id: string) => void
): MapCreator {
  let Template: any = (id: string) => {
    if (!Template.cache[id]) {
      Template.cache[id] = Template.build(id)
    }
    return Template.cache[id]
  }

  Template.build = (id: string) => {
    let store = map({ id, value: null })
    onMount(store, () => {
      if (init) init(store, id)
      return () => {
        delete Template.cache[id]
      }
    })
    return store
  }

  Template.cache = {}

  return Template
}

let out = ''
let groups = 0

beforeAll(() => {
  vi.spyOn(console, 'groupCollapsed').mockImplementation((...args: any[]) => {
    console.log(...args)
    groups += 1
  })
  vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    if (out === '') out += '\n'
    out += format(groups, [], ...args) + '\n'
  })
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {
    groups -= 1
  })
})

afterEach(() => {
  out = ''
  groups = 0
})

it('prints logs from store builder', async () => {
  let creator = createMapCreator($store => {
    $store.setKey('value', 0)
    let increaseValue = action($store, 'Increase Value', store => {
      store.setKey('value', Number(store.get().value) + 1)
    })
    increaseValue()
    increaseValue()
    increaseValue()
  })
  let destroy = creatorLogger({ 'Map Creator': creator })

  let $first = creator('1')
  let $second = creator('2')
  let $third = creator('3')
  let unbindFirst = $first.listen(() => {})
  let unbindSecond = $second.listen(() => {})
  let unbindThird = $third.listen(() => {})
  unbindFirst()
  unbindSecond()
  unbindThird()
  await delay(STORE_UNMOUNT_DELAY + 10)
  expect(out).toMatchSnapshot()

  destroy()
})

it('returns unbind function', () => {
  let creator = createMapCreator()
  let destroy = creatorLogger({ 'Map Creator': creator })
  destroy()

  let $store = creator('1')
  let unbindStore = $store.listen(() => {})
  unbindStore()

  expect(out).toBe('')
})
