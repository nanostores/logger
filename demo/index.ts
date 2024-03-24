import { delay } from 'nanodelay'
import { atom, deepMap, map, STORE_UNMOUNT_DELAY } from 'nanostores'

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

logger({
  Artist: $map,
  Counter: $atom,
  Suprematists: $deepMap
})

async function run(): Promise<void> {
  let unbindAtom = $atom.listen(() => {})
  $atom.set(100)
  $atom.set(101)
  $atom.set(Number($atom.get()) + 1)
  $atom.set(Number($atom.get()) + 1)
  $atom.set(Number($atom.get()) + 1)
  unbindAtom()
  await delay(STORE_UNMOUNT_DELAY + 10)

  $map.setKey('artworks', 303)

  await delay(STORE_UNMOUNT_DELAY)
  $map.setKey('username', 'chashnik')
  $map.setKey('fullname', 'Ilya Chashnik')

  await delay(STORE_UNMOUNT_DELAY)
  $map.setKey('username', 'malevich')
  $map.setKey('fullname', 'Kazimir Malevich')

  $deepMap.setKey('artists.malevich.movement', 'Suprematism')

  let artworks = ['White on White', 'Suprematist Composition', 'Black Circle']
  for (let item of artworks) {
    await delay(100)
    let index = $deepMap.get().artists.malevich.artworks.length
    $deepMap.setKey(`artists.malevich.artworks[${index}]`, item)
  }
  await delay(STORE_UNMOUNT_DELAY + 10)
}

setTimeout(run, 1000)
