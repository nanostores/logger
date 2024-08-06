import { delay } from 'nanodelay'
import {
  atom,
  cleanStores,
  deepMap,
  map,
  STORE_UNMOUNT_DELAY
} from 'nanostores'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'

import { action } from '../index.js'
import { format } from '../test/index.js'
import { logger } from './index.js'

let $atom = atom()
let $map = map({
  artworks: 213,
  fullname: 'Nikolay Suetin',
  id: 'A10',
  username: 'suetin'
})
let $deepMap = deepMap<{
  artists: {
    [key: string]: {
      artworks: string[]
      movement: null | string
    }
  }
}>({
  artists: {
    malevich: {
      artworks: [],
      movement: null
    }
  }
})

let increaseCounter = action($atom, 'Increase Counter', store => {
  store.set(Number(store.get()) + 1)
})

let changeUserArtworks = action(
  $map,
  'Change User Artworks',
  (store, value) => {
    store.setKey('artworks', value)
  }
)

let changeUser = action(
  $map,
  'Change User',
  async (store, username = 'chashnik', fullname = 'Ilya Chashnik') => {
    await delay(1000)
    store.setKey('username', username)
    store.setKey('fullname', fullname)
  }
)

let brokenAction = action($map, 'Broken Throw', async () => {
  throw Error('Something went wrong in the action Throw Error')
})

let addArtworks = action(
  $deepMap,
  'Add Artworks',
  async (store, artist: string, artworks: string[]) => {
    for (let item of artworks) {
      // await delay(100)
      let index = store.get().artists.malevich.artworks.length
      store.setKey(`artists.${artist}.artworks[${index}]`, item)
    }
    throw Error('Something went wrong in action Add Artworks')
  }
)

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
  cleanStores($atom, $map, $deepMap)
})

it('prints logs', async () => {
  let destroy = logger({ $atom, $deepMap, $map })

  let unbindAtom = $atom.listen(() => {})
  $atom.set(100)
  $atom.set(101)
  increaseCounter()
  increaseCounter()
  increaseCounter()
  unbindAtom()
  await delay(STORE_UNMOUNT_DELAY + 10)

  changeUserArtworks(303)

  await changeUser()
  await changeUser('malevich', 'Kazimir Malevich')

  try {
    await brokenAction()
  } catch {}

  $deepMap.setKey('artists.malevich.movement', 'Suprematism')

  try {
    await addArtworks('malevich', [
      'White on White',
      'Suprematist Composition',
      'Black Circle'
    ])
  } catch {}
  await delay(STORE_UNMOUNT_DELAY + 10)

  expect(out).toMatchSnapshot()

  destroy()
})

it('returns unbind function', () => {
  let destroy = logger({ $atom })

  destroy()
  $atom.set(100)

  expect(out).toBe('')
})

it('handles and throws error in action', async () => {
  let destroy = logger({ $map })

  await expect(async () => await brokenAction()).rejects.toThrowError()
  expect(out).toMatchSnapshot()

  destroy()
})

it('has option to disable mount logs', async () => {
  let destroy = logger({ $atom }, { messages: { mount: false } })

  $atom.listen(() => {})()
  await delay(STORE_UNMOUNT_DELAY + 10)
  expect(out).toMatchSnapshot()

  destroy()
})

it('has option to disable unmount logs', async () => {
  let destroy = logger({ $atom }, { messages: { unmount: false } })

  $atom.listen(() => {})()
  await delay(STORE_UNMOUNT_DELAY + 10)
  expect(out).toMatchSnapshot()

  destroy()
})

it('has option to disable change logs', async () => {
  let destroy = logger({ $atom, $map }, { messages: { change: false } })

  let unbindAtom = $atom.listen(() => {})
  let unbindMap = $map.listen(() => {})
  $atom.set(100)
  $map.setKey('artworks', 302)
  changeUserArtworks(303)
  unbindAtom()
  unbindMap()
  await delay(STORE_UNMOUNT_DELAY + 10)
  expect(out).toMatchSnapshot()

  destroy()
})

it('has option to disable action logs', async () => {
  let destroy = logger({ $atom, $map }, { messages: { change: false } })

  let unbindAtom = $atom.listen(() => {})
  let unbindMap = $map.listen(() => {})
  $atom.set(100)
  $map.setKey('artworks', 302)
  changeUserArtworks(303)
  unbindAtom()
  unbindMap()
  await delay(STORE_UNMOUNT_DELAY + 10)
  expect(out).toMatchSnapshot()

  destroy()
})

it('has option to disable actions with specific name', async () => {
  let destroy = logger({ $atom, $map }, { ignoreActions: ['Change User'] })

  let unbindMap = $map.listen(() => {})
  await changeUser('puni', 'Ivan Puni')
  changeUserArtworks(56)
  unbindMap()
  await delay(STORE_UNMOUNT_DELAY + 10)
  expect(out).toMatchSnapshot()

  destroy()
})
