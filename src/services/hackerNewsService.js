// hackerNewsService.js
// Hacker News a une API publique officielle et gratuite.
// On récupère les top stories puis on fetch chaque article.
// C'est un exemple parfait d'API qui demande plusieurs appels.

import fetch from 'node-fetch'
import { getCache, setCache } from '../cache.js'

// Fetch un seul article par son ID
async function fetchStory(id) {
  const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json`
  const res = await fetch(url)
  return res.json()
}

export async function fetchHackerNewsTop(limit = 12) {
  const cacheKey = `hn_top_${limit}`

  const cached = getCache(cacheKey)
  if (cached) return cached

  // 1. Récupère la liste des IDs des top stories
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
  const ids = await idsRes.json()

  // 2. On prend les X premiers IDs
  const topIds = ids.slice(0, limit)

  // 3. On fetch chaque article en parallèle
  // Promise.all = lance tous les fetch en même temps
  // au lieu de les faire un par un (beaucoup plus rapide !)
  const stories = await Promise.all(topIds.map(id => fetchStory(id)))

  // 4. On filtre les articles valides et on nettoie
  const cleaned = stories
    .filter(s => s && s.title && s.type === 'story')
    .map(story => ({
      id:          `hn_${story.id}`,
      source:      'hackernews',
      sourceLabel: 'Hacker News',
      title:       story.title,
      desc:        story.text ? story.text.replace(/<[^>]*>/g, '').slice(0, 120) + '...' : 'Voir l\'article sur Hacker News.',
      url:         story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      author:      story.by,
      points:      story.score,
      comments:    story.descendants || 0,
      publishedAt: new Date(story.time * 1000).toISOString(),
      tags:        [],
      meta:        `${story.score} points · ${story.descendants || 0} commentaires`,
      color:       '#60a5fa',
      accent:      'rgba(96,165,250,0.1)',
      border:      'rgba(96,165,250,0.2)',
    }))

  setCache(cacheKey, cleaned)
  return cleaned
}