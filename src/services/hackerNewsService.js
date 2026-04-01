import fetch from 'node-fetch'
import { getCache, setCache } from '../cache.js'

async function fetchStory(id) {
  const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json`
  const res = await fetch(url)
  return res.json()
}

export async function fetchHackerNewsTop(limit = 12) {
  const cacheKey = `hn_top_${limit}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
  const ids = await idsRes.json()
  const topIds = ids.slice(0, limit)

  const stories = await Promise.all(topIds.map(id => fetchStory(id)))

  const cleaned = stories
    .filter(s => s && s.title && s.type === 'story')
    .map(story => {
      let cover = null
      try {
        if (story.url) {
          const domain = new URL(story.url).hostname
          cover = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        }
      } catch {}

      return {
        id:          `hn_${story.id}`,
        source:      'hackernews',
        sourceLabel: 'Hacker News',
        title:       story.title,
        desc:        story.text
          ? story.text.replace(/<[^>]*>/g, '').slice(0, 120) + '...'
          : 'Voir l\'article sur Hacker News.',
        url:         story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        cover,
        author:      story.by,
        points:      story.score,
        comments:    story.descendants || 0,
        publishedAt: new Date(story.time * 1000).toISOString(),
        tags:        [],
        meta:        `${story.score} points · ${story.descendants || 0} commentaires`,
        color:       '#60a5fa',
        accent:      'rgba(96,165,250,0.1)',
        border:      'rgba(96,165,250,0.2)',
      }
    })

  setCache(cacheKey, cleaned)
  return cleaned
}