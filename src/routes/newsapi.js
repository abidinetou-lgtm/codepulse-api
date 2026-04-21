// routes/newsapi.js — articles tech depuis NewsAPI
import { Router } from 'express'
import { fetchNewsApi } from '../services/newsApiService.js'

const router = Router()

router.get('/articles', async (req, res) => {
  try {
    const query = req.query.q || 'javascript react nodejs'
    const articles = await fetchNewsApi(query)
    res.json({ success: true, count: articles.length, data: articles })
  } catch (error) {
    console.error('Erreur NewsAPI:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router