// server.js — Point d'entrée du backend CodePulse
// Sécurité : rate limiting, CORS strict, headers de sécurité,
// validation des inputs, pas de stack trace exposé en prod.
 
import express    from 'express'
import cors       from 'cors'
import dotenv     from 'dotenv'
 
import devtoRoutes      from './src/routes/devto.js'
import hackernewsRoutes from './src/routes/hackernews.js'
import newsApiRoutes    from './src/routes/newsapi.js'
 
dotenv.config()
 
const app  = express()
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'
 
// ── RATE LIMITING MAISON ──────────────────────────────
// Limite le nombre de requêtes par IP par fenêtre de temps.
// Empêche le scraping et les attaques par déni de service.
const requestCounts = new Map()
 
function rateLimiter(maxRequests = 60, windowMs = 60_000) {
  return function (req, res, next) {
    const ip  = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    const now = Date.now()
    const key = `${ip}`
 
    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
 
    const record = requestCounts.get(key)
 
    // Fenêtre expirée → reset
    if (now > record.resetAt) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
 
    record.count++
 
    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error:   'Trop de requêtes. Réessaie dans une minute.',
      })
    }
 
    next()
  }
}
 
// Nettoyage toutes les 5 min pour éviter une fuite mémoire
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) requestCounts.delete(key)
  }
}, 5 * 60_000)
 
// ── CORS ─────────────────────────────────────────────
// Seuls les domaines autorisés peuvent appeler l'API.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'https://codepulse-rouge.vercel.app',
]
 
app.use(cors({
  origin: function (origin, callback) {
    // Autorise les requêtes sans origin (curl, Postman, etc.) en dev
    if (!origin && !isProd) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`Origin non autorisée : ${origin}`))
  },
  methods:     ['GET'],          // CodePulse ne fait que des GET publics
  credentials: false,
}))
 
// ── HEADERS DE SÉCURITÉ ──────────────────────────────
// Protègent contre le clickjacking, XSS, sniffing MIME.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options',        'DENY')
  res.setHeader('X-XSS-Protection',       '1; mode=block')
  res.setHeader('Referrer-Policy',        'no-referrer')
  // Empêche de cacher des infos serveur
  res.removeHeader('X-Powered-By')
  next()
})
 
app.use(express.json({ limit: '10kb' })) // Limite la taille des requêtes
 
// ── RATE LIMITING GLOBAL ──────────────────────────────
// 60 requêtes par minute par IP sur toute l'API
app.use('/api', rateLimiter(60, 60_000))
 
// ── ROUTES ───────────────────────────────────────────
app.use('/api/devto',      devtoRoutes)
app.use('/api/hackernews', hackernewsRoutes)
app.use('/api/newsapi',    newsApiRoutes)
 
// Route de santé — ne révèle pas d'infos sensibles
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
 
// ── 404 ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable.' })
})
 
// ── ERREUR GLOBALE ────────────────────────────────────
// Ne jamais exposer la stack trace en production.
app.use((err, req, res, _next) => {
  const status = err.status || 500
  const message = isProd ? 'Erreur interne du serveur.' : err.message
  res.status(status).json({ success: false, error: message })
})
 
app.listen(PORT, () => {
  console.log(`✅ CodePulse API → http://localhost:${PORT}`)
})