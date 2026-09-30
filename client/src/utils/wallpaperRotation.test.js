import test from 'node:test'
import assert from 'node:assert/strict'
import { createWallpaperRotation, getWallpaperAssignments } from './wallpaperRotation.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('uses every wallpaper once before starting a new cycle', () => {
  const wallpapers = ['a', 'b', 'c', 'd', 'e']
  const rotation = createWallpaperRotation(wallpapers, memoryStorage(), () => 0.37)
  const firstCycle = wallpapers.map(() => rotation.next())
  const secondCycle = wallpapers.map(() => rotation.next())

  assert.equal(new Set(firstCycle).size, wallpapers.length)
  assert.deepEqual(new Set(firstCycle), new Set(wallpapers))
  assert.equal(new Set(secondCycle).size, wallpapers.length)
  assert.notEqual(firstCycle.at(-1), secondCycle[0])
})

test('persists the bag position and avoids immediate repeats after reload', () => {
  const storage = memoryStorage()
  const firstRotation = createWallpaperRotation(['a', 'b', 'c'], storage, () => 0.2)
  const first = firstRotation.next()
  const second = createWallpaperRotation(['a', 'b', 'c'], storage, () => 0.8).next()

  assert.notEqual(first, second)
  const state = JSON.parse(storage.getItem('lorekeeper:wallpaper-rotation'))
  assert.equal(state.last, second)
  assert.equal(state.bag.length, 1)
})

test('assigns distinct wallpapers to a page and retains assignments across reloads', () => {
  const storage = memoryStorage()
  const ids = ['a', 'b', 'c', 'd']
  const slots = ['hero', 'campaigns', 'people']
  const assignments = getWallpaperAssignments(storage, ids, slots)
  const reloaded = getWallpaperAssignments(storage, ids, slots)

  assert.equal(new Set(slots.map((slot) => assignments[slot])).size, slots.length)
  assert.deepEqual(reloaded, assignments)
})

test('keeps page backgrounds distinct when a batch crosses into a new cycle', () => {
  const storage = memoryStorage()
  const ids = ['a', 'b', 'c', 'd', 'e']
  const rotation = createWallpaperRotation(ids, storage, () => 0.37)
  rotation.next()
  rotation.next()
  rotation.next()

  const assignments = getWallpaperAssignments(storage, ids, ['hero', 'campaigns', 'places'])

  assert.equal(new Set(Object.values(assignments)).size, 3)
  assert.notEqual(JSON.parse(storage.getItem('lorekeeper:wallpaper-rotation')).last, null)
})

test('returns empty assignments when no wallpaper assets are available', () => {
  assert.deepEqual(getWallpaperAssignments(memoryStorage(), [], ['hero', 'finale']), { hero: '', finale: '' })
})