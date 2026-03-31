// devtoService.js
// Ce fichier contient la LOGIQUE d'appel à l'API Dev.to.
// On sépare la logique (service) de la route (controller)
// — c'est une bonne pratique pro appelée "separation of concerns".

import fetch from 'node-fetch'
import { getCache, setCache } from '../cache.js'

// Les tags qui nous intéressent
const TAGS = ['javascript', 'react', 'node', 'webdev', 'ai']

export async function fetchDevtoArticles(tag = 'javascript', perPage = 12) {
  const cacheKey = `devto_${tag}_${perPage}`

  // 1. On vérifie le cache d'abord
  const cached = getCache(cacheKey)
  if (cached) return cached

  // 2. Si pas en cache → on appelle l'API Dev.to
  // L'API Dev.to est publique — pas besoin de clé !
  const url = `https://dev.to/api/articles?tag=${tag}&per_page=${perPage}&top=1`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Dev.to API error: ${response.status}`)
  }

  const articles = await response.json()

  // 3. On transforme les données pour notre app
  // On garde seulement ce dont on a besoin
  const cleaned = articles.map(article => ({
    id:          article.id,
    source:      'devto',
    sourceLabel: 'Dev.to',
    title:       article.title,
    desc:        article.description || '',
    url:         article.url,
    cover:       article.cover_image,
    tags:        article.tag_list,
    reactions:   article.positive_reactions_count,
    comments:    article.comments_count,
    author:      article.user.name,
    avatar:      article.user.profile_image_90,
    publishedAt: article.published_at,
    meta:        `${article.positive_reactions_count} réactions · ${article.reading_time_minutes} min`,
    color:       '#22d3ee',
    accent:      'rgba(6,182,212,0.1)',
    border:      'rgba(6,182,212,0.2)',
  }))

  // 4. On met en cache pour 5 minutes
  setCache(cacheKey, cleaned)

  return cleaned
}

export { TAGS }