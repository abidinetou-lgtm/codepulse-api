// cache.js
// Cache amélioré — la clé inclut TOUS les paramètres
// donc GitHub+javascript et GitHub+python sont
// deux entrées séparées dans le cache.

const cache = new Map()
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function getCache(key) {
  try {
    const item = cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      cache.delete(key)
      return null
    }
    console.log(`📦 Cache hit: ${key}`)
    return item.data
  } catch {
    return null
  }
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    cache.set(key, { data, expiresAt: Date.now() + ttl })
    console.log(`💾 Cache set: ${key}`)
  } catch {}
}

// Vider tout le cache (utile pour le debug)
export function clearCache() {
  cache.clear()
  console.log('🗑️ Cache cleared')
}