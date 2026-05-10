// services/newsApiService.js
// Récupère les articles depuis NewsAPI.org
// Clé API stockée uniquement dans les variables d'environnement
// — jamais dans le code source.

import fetch        from 'node-fetch'
import { getCache, setCache } from '../cache.js'

const NEWS_API_KEY = process.env.NEWS_API_KEY || ''
const NEWS_API_URL = 'https://newsapi.org/v2/everything'

// Liste blanche de requêtes autorisées
// Empêche un utilisateur de faire rechercher n'importe quoi
const ALLOWED_QUERIES = new Set([
  'javascript programming',
  'react javascript framework',
  'nodejs backend',
  'web development frontend',
  'artificial intelligence machine learning',
  'typescript programming',
  'python programming',
  'tech news software',
])

function sanitizeQuery(q = '') {
  // Nettoie et valide le paramètre de recherche
  const trimmed = q.trim().toLowerCase().slice(0, 100)
  if (ALLOWED_QUERIES.has(trimmed)) return trimmed
  // Si la requête n'est pas dans la liste blanche, requête par défaut
  return 'tech news software'
}

export async function fetchNewsApi(rawQuery = 'tech news software', pageSize = 15) {
  const query    = sanitizeQuery(rawQuery)
  const cacheKey = `newsapi_${query}_${pageSize}`
  const cached   = getCache(cacheKey)
  if (cached) return cached

  if (!NEWS_API_KEY) {
    console.warn('⚠️  NEWS_API_KEY non configurée — NewsAPI désactivée')
    return []
  }

  try {
    const params = new URLSearchParams({
      q:        query,
      language: 'en',
      sortBy:   'publishedAt',
      pageSize: String(pageSize),
      apiKey:   NEWS_API_KEY,
    })

    const response = await fetch(`${NEWS_API_URL}?${params}`, {
      headers: { 'User-Agent': 'CodePulse/1.0' },
      // Timeout 8 secondes pour éviter de bloquer le serveur
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error(`NewsAPI HTTP ${response.status}`)
      return []
    }

    const data = await response.json()

    if (data.status !== 'ok') {
      // Ne pas logger le message complet en prod (peut contenir la clé)
      console.warn('NewsAPI status non-ok')
      return []
    }

    const cleaned = (data.articles || [])
      .filter(a =>
        a.title &&
        a.url &&
        !a.title.includes('[Removed]') &&
        a.source?.name !== '[Removed]'
      )
      .map((a, i) => ({
        id:          `newsapi_${Buffer.from(a.url || '').toString('base64').slice(0, 12)}_${i}`,
        source:      'newsapi',
        sourceLabel: a.source?.name || 'Tech News',
        title:       a.title.slice(0, 200),            // limite la longueur
        desc:        (a.description || '').slice(0, 300),
        url:         a.url,
        cover:       a.urlToImage || null,
        tags:        ['tech', 'news'],
        meta:        new Date(a.publishedAt).toLocaleDateString('fr-FR'),
        author:      (a.author || a.source?.name || '').slice(0, 80),
        color:       '#7c3aed',
        accent:      'rgba(124,58,237,0.08)',
        border:      'rgba(124,58,237,0.15)',
      }))

    // Cache 10 minutes (NewsAPI est limitée à 100 req/jour en gratuit)
    setCache(cacheKey, cleaned, 10 * 60_000)
    return cleaned

  } catch (err) {
    // Ne jamais exposer les détails de l'erreur au client
    if (err.name === 'TimeoutError') {
      console.error('NewsAPI timeout')
    } else {
      console.error('NewsAPI fetch error:', err.name)
    }
    return []
  }
}