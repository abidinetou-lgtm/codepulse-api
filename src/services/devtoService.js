import fetch from 'node-fetch'
import { getCache, setCache } from '../cache.js'

const TAGS = ['javascript', 'react', 'node', 'webdev', 'ai']

export async function fetchDevtoArticles(tag = 'javascript', perPage = 12) {
  const cacheKey = `devto_${tag}_${perPage}`
  const cached = getCache(cacheKey)
  if (cached) return cached

  const url = `https://dev.to/api/articles?tag=${tag}&per_page=${perPage}&top=1`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Dev.to API error: ${response.status}`)
  }

  const articles = await response.json()

  const cleaned = articles.map(article => ({
    id:          article.id,
    source:      'devto',
    sourceLabel: 'Dev.to',
    title:       article.title,
    desc:        article.description || '',
    url:         article.url,
    cover:       article.cover_image || article.social_image || null,
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

  setCache(cacheKey, cleaned)
  return cleaned
}

export { TAGS }