// services/newsApiService.js — appel NewsAPI.org
import { getCache, setCache } from '../cache.js'

// Clé gratuite sur newsapi.org — 100 req/jour
const NEWS_API_KEY = process.env.NEWS_API_KEY || ''

export async function fetchNewsApi(query = 'javascript react nodejs', pageSize = 12) {
  const cacheKey = `newsapi_${query}`
  const cached   = getCache(cacheKey)
  if (cached) return cached

  // Si pas de clé configurée, retourne des données vides
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY non configurée — NewsAPI désactivée')
    return []
  }

  try {
    const url = `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(query)}` +
      `&language=en` +
      `&sortBy=publishedAt` +
      `&pageSize=${pageSize}` +
      `&apiKey=${NEWS_API_KEY}`

    const response = await fetch(url)
    const data     = await response.json()

    if (data.status !== 'ok') {
      console.warn('NewsAPI erreur:', data.message)
      return []
    }

    const cleaned = data.articles
      .filter(a => a.title && a.url && !a.title.includes('[Removed]'))
      .map(function(a, i) {
        return {
          id:          `newsapi_${i}_${Date.now()}`,
          source:      'newsapi',
          sourceLabel: a.source?.name || 'Tech News',
          title:       a.title,
          desc:        a.description || '',
          url:         a.url,
          cover:       a.urlToImage || null,
          tags:        ['tech', 'news'],
          meta:        new Date(a.publishedAt).toLocaleDateString('fr-FR'),
          author:      a.author || a.source?.name || '',
          color:       '#7c3aed',
          accent:      'rgba(124,58,237,0.08)',
          border:      'rgba(124,58,237,0.15)',
        }
      })

    setCache(cacheKey, cleaned)
    return cleaned

  } catch (error) {
    console.error('NewsAPI fetch error:', error)
    return []
  }
}