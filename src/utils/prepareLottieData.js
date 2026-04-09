/**
 * Slightly increase vector stroke widths (outline-style icons read “hollow” in a tab bar next to solid ones).
 * Only touches static `ty: 'st'` items with numeric `w.k`.
 */
function scaleStrokeWidthsInPlace(o, factor) {
  if (!o || typeof o !== 'object') return
  if (Array.isArray(o)) {
    o.forEach((x) => scaleStrokeWidthsInPlace(x, factor))
    return
  }
  if (o.ty === 'st' && o.w && typeof o.w === 'object' && typeof o.w.k === 'number' && factor > 1) {
    o.w.k = Math.min(Math.round(o.w.k * factor * 100) / 100, 64)
  }
  for (const k of Object.keys(o)) scaleStrokeWidthsInPlace(o[k], factor)
}

/**
 * Vite JSON import is usually a plain object; normalize and clone so lottie-web can mutate safely.
 * Strips `ct` (newer Bodymovin fields) that some lottie-web builds mishandle.
 *
 * @param {object} [options]
 * @param {string[]} [options.omitLayers] — top-level layer `nm` values to remove (e.g. ground disc).
 * @param {number} [options.strokeWidthScale] — multiply static stroke widths (e.g. 1.15 for regular/outline icons).
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
    const sw = options.strokeWidthScale
    if (typeof sw === 'number' && sw > 1) scaleStrokeWidthsInPlace(clone, sw)
    return clone
  } catch {
    return null
  }
}
