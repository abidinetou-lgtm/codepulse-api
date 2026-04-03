import { Router } from 'express'
import { fetchDevtoArticles, TAGS } from '../services/devtoService.js'

const router = Router()

// GET /api/devto/articles?tag=react&limit=12
router.get('/articles', async (req, res) => {
  try {
    const tag     = req.query.tag   || 'javascript'
    const perPage = parseInt(req.query.limit) || 12

    console.log(`Dev.to articles — tag: "${tag}", limit: ${perPage}`)

    const articles = await fetchDevtoArticles(tag, perPage)

    res.json({
      success: true,
      source:  'devto',
      params:  { tag, perPage },
      count:   articles.length,
      data:    articles
    })

  } catch (error) {
    console.error('Dev.to route error:', error)
    res.status(500).json({
      success: false,
      error:   'Impossible de récupérer les articles Dev.to'
    })
  }
})

router.get('/tags', (req, res) => {
  res.json({ success: true, data: TAGS })
})

export default router