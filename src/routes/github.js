// routes/github.js

import { Router } from 'express'
import { fetchGithubTrending } from '../services/githubService.js'

const router = Router()

// GET /api/github/trending?language=javascript&since=daily
router.get('/trending', async (req, res) => {
  try {
    const language = req.query.language || ''
    const since    = req.query.since    || 'daily'

    const repos = await fetchGithubTrending(language, since)

    res.json({
      success: true,
      source:  'github',
      count:   repos.length,
      data:    repos
    })

  } catch (error) {
    console.error('GitHub route error:', error)
    res.status(500).json({
      success: false,
      error:   'Impossible de récupérer les repos GitHub'
    })
  }
})

export default router