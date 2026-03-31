// githubService.js
// Récupère les repos GitHub tendance.
// GitHub n'a pas d'API officielle pour les tendances,
// donc on utilise une API non officielle fiable.

import fetch from 'node-fetch'
import { getCache, setCache } from '../cache.js'

export async function fetchGithubTrending(language = '', since = 'daily') {
  const cacheKey = `github_${language}_${since}`

  const cached = getCache(cacheKey)
  if (cached) return cached

  // API non-officielle GitHub Trending (très utilisée)
  const url = `https://gh-trending-api.vercel.app/repositories?language=${language}&since=${since}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()

    const cleaned = repos.slice(0, 12).map((repo, i) => ({
      id:          `gh_${i}_${repo.name}`,
      source:      'github',
      sourceLabel: 'GitHub',
      title:       repo.name,
      desc:        repo.description || 'Pas de description disponible.',
      url:         repo.url,
      author:      repo.author,
      avatar:       repo.avatar,
      language:    repo.language,
      stars:       repo.stars,
      forks:       repo.forks,
      starsToday:  repo.currentPeriodStars,
      tags:        repo.language ? [repo.language] : [],
      meta:        `⭐ ${repo.stars?.toLocaleString()} stars · +${repo.currentPeriodStars} aujourd'hui`,
      color:       '#34d399',
      accent:      'rgba(52,211,153,0.1)',
      border:      'rgba(52,211,153,0.2)',
    }))

    setCache(cacheKey, cleaned)
    return cleaned

  } catch (err) {
    console.error('GitHub trending error:', err.message)
    return []
  }
}