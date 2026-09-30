const STORAGE_KEY = 'lorekeeper:wallpaper-rotation'

function shuffled(items, random) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function createWallpaperRotation(wallpapers, storage = globalThis.localStorage, random = Math.random) {
  const available = [...new Set(wallpapers)]
  if (!available.length) throw new Error('At least one wallpaper is required.')

  function readState() {
    try {
      const saved = JSON.parse(storage.getItem(STORAGE_KEY) || '{}')
      return {
        bag: Array.isArray(saved.bag) ? saved.bag.filter((wallpaper) => available.includes(wallpaper)) : [],
        last: available.includes(saved.last) ? saved.last : null,
      }
    } catch {
      return { bag: [], last: null }
    }
  }

  function writeState(state) {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function refill(state) {
    state.bag = shuffled(available, random)
    if (state.bag.length > 1 && state.bag[0] === state.last) {
      const swapIndex = 1 + Math.floor(random() * (state.bag.length - 1))
      ;[state.bag[0], state.bag[swapIndex]] = [state.bag[swapIndex], state.bag[0]]
    }
  }

  function next(excluded = []) {
    const state = readState()
    const excludedWallpapers = new Set(excluded)
    let index = -1

    while (index === -1) {
      if (!state.bag.length) refill(state)
      index = state.bag.findIndex((wallpaper) => !excludedWallpapers.has(wallpaper) && wallpaper !== state.last)
      if (index === -1) {
        const remaining = state.bag.findIndex((wallpaper) => !excludedWallpapers.has(wallpaper))
        if (remaining !== -1) index = remaining
        else if (state.bag.length) excludedWallpapers.clear()
      }
    }

    const [wallpaper] = state.bag.splice(index, 1)
    state.last = wallpaper
    writeState(state)
    return wallpaper
  }

  return { next, available }
}

export function getWallpaperAssignments(storage, wallpaperIds, slots) {
  if (!wallpaperIds.length) return Object.fromEntries(slots.map((slot) => [slot, '']))

  const key = 'lorekeeper:wallpaper-assignments'
  let saved = {}
  try {
    saved = JSON.parse(storage.getItem(key) || '{}')
  } catch {
    saved = {}
  }

  const valid = slots.every((slot) => wallpaperIds.includes(saved[slot]))
    && new Set(slots.map((slot) => saved[slot])).size === slots.length
  if (valid) return saved

  const rotation = createWallpaperRotation(wallpaperIds, storage)
  const assignments = {}
  for (const slot of slots) {
    assignments[slot] = rotation.next(Object.values(assignments))
  }
  storage.setItem(key, JSON.stringify(assignments))
  return assignments
}