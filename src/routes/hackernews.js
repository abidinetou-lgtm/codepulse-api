// routes/hackernews.js

import { Router } from 'express'
import { fetchHackerNewsTop } from '../services/hackerNewsService.js'

const router = Router()

// GET /api/hackernews/top?limit=12
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12

    const stories = await fetchHackerNewsTop(limit)

    res.json({
      success: true,
      source:  'hackernews',
      count:   stories.length,
      data:    stories
    })

  } catch (error) {
    console.error('HackerNews route error:', error)
    res.status(500).json({
      success: false,
      error:   'Impossible de récupérer les stories Hacker News'
    })
  }
})

export default router