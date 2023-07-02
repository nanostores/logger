import { delay } from 'nanodelay'
import { action, atom, deepMap, map, STORE_UNMOUNT_DELAY } from 'nanostores'

import { logger } from '../index.js'

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
      artworks: ['Black Square'],
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

let addArtworks = action(
  $deepMap,
  'Add Artworks',
  async (store, artist: string, artworks: string[]) => {
    for (let item of artworks) {
      await delay(100)
      let index = store.get().artists.malevich.artworks.length
      store.setKey(`artists.${artist}.artworks[${index}]`, item)
    }
    throw Error('Something went wrong in action Add Artworks')
  }
)

logger({
  Artist: $map,
  Counter: $atom,
  Suprematists: $deepMap
})

async function run(): Promise<void> {
  let unbindAtom = $atom.listen(() => {})
  increaseCounter()
  unbindAtom()
  await delay(STORE_UNMOUNT_DELAY + 10)

  changeUserArtworks(303)

  await changeUser('malevich', 'Kazimir Malevich')

  $deepMap.setKey('artists.malevich.movement', 'Suprematism')
  try {
    await addArtworks('malevich', [
      'White on White',
      'Suprematist Composition',
      'Black Circle'
    ])
  } catch {}
  await delay(STORE_UNMOUNT_DELAY + 10)
}

setTimeout(run, 1000)
