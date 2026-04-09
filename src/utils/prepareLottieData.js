/**
 * Vite JSON import is usually a plain object; normalize and clone so lottie-web can mutate safely.
 * Strips `ct` (newer Bodymovin fields) that some lottie-web builds mishandle.
 *
 * @param {object} [options]
 * @param {string[]} [options.omitLayers] — top-level layer `nm` values to remove (e.g. ground disc).
 */
export function prepareLottieData(raw, options = {}) {
  const data = raw && typeof raw === 'object' && 'default' in raw ? raw.default : raw
  if (!data || typeof data !== 'object') return null
  try {
    const clone = JSON.parse(JSON.stringify(data))
    const omit = options.omitLayers
    if (Array.isArray(omit) && omit.length > 0 && Array.isArray(clone.layers)) {
      const drop = new Set(omit.map((n) => String(n).trim()))
      clone.layers = clone.layers.filter((layer) => !drop.has(String(layer.nm ?? '').trim()))
    }
    const walk = (o) => {
      if (!o || typeof o !== 'object') return
      if (Array.isArray(o)) {
        o.forEach(walk)
        return
      }
      if ('ct' in o) delete o.ct
      for (const k of Object.keys(o)) walk(o[k])
    }
    walk(clone)
    return clone
  } catch {
    return null
  }
}
