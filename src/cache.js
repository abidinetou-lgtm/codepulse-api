// cache.js
// Un cache simple en mémoire.
// Imagine un Post-it sur ton bureau :
// tu écris la réponse dessus, et pendant 5 minutes
// tu lis le Post-it au lieu de rappeler l'API.
// Après 5 minutes, le Post-it est périmé — on rappelle.

const cache = new Map()

// TTL = Time To Live = durée de vie en millisecondes
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function getCache(key) {
  const item = cache.get(key)
  if (!item) return null

  // Est-ce que le cache est encore valide ?
  const isExpired = Date.now() > item.expiresAt
  if (isExpired) {
    cache.delete(key) // On nettoie
    return null
  }

  console.log(`📦 Cache hit: ${key}`)
  return item.data
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  })
  console.log(`💾 Cache set: ${key}`)
}