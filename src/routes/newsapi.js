// routes/newsapi.js
// Endpoint : GET /api/newsapi/articles?q=javascript+programming
// Validation des paramètres côté serveur avant d'appeler le service.

import { Router } from 'express'
import { fetchNewsApi } from '../services/newsApiService.js'

const router = Router()

router.get('/articles', async (req, res) => {
  try {
    // Validation du paramètre q
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : ''

    // pageSize borné entre 5 et 20 pour éviter les abus
    const rawSize  = parseInt(req.query.pageSize, 10)
    const pageSize = isNaN(rawSize) ? 15 : Math.min(Math.max(rawSize, 5), 20)

    const articles = await fetchNewsApi(rawQuery, pageSize)

    // Ne pas révéler si la clé manque — réponse neutre
    res.json({ success: true, count: articles.length, data: articles })

  } catch (err) {
    console.error('Route /api/newsapi/articles error:', err.name)
    res.status(500).json({ success: false, error: 'Erreur serveur.' })
  }
})

export default router