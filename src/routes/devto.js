// routes/devto.js
// La route = l'adresse URL que le frontend va appeler.
// Le service = la logique qui va chercher les données.
// La route appelle le service et renvoie le résultat.

import { Router } from 'express'
import { fetchDevtoArticles, TAGS } from '../services/devtoService.js'

const router = Router()

// GET /api/devto/articles?tag=javascript&limit=12
// Le "?" signifie que les paramètres sont optionnels
router.get('/articles', async (req, res) => {
  try {
    // req.query = les paramètres dans l'URL après le "?"
    const tag     = req.query.tag     || 'javascript'
    const perPage = req.query.limit   || 12

    const articles = await fetchDevtoArticles(tag, perPage)

    // res.json() = envoie la réponse en JSON au frontend
    res.json({
      success: true,
      source:  'devto',
      count:   articles.length,
      data:    articles
    })

  } catch (error) {
    // En cas d'erreur, on renvoie un message clair
    console.error('Dev.to route error:', error)
    res.status(500).json({
      success: false,
      error:   'Impossible de récupérer les articles Dev.to'
    })
  }
})

// GET /api/devto/tags — renvoie les tags disponibles
router.get('/tags', (req, res) => {
  res.json({ success: true, data: TAGS })
})

export default router