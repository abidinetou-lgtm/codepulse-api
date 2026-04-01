// server.js
// C'est le point d'entrée du backend.
// Imagine-le comme le "main.jsx" mais côté serveur.
// Il crée le serveur Express et branche toutes les routes.

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Routes — chaque fichier gère une API différente
import devtoRoutes from './src/routes/devto.js'
import githubRoutes from './src/routes/github.js'
import hackernewsRoutes from './src/routes/hackernews.js'

// Charge les variables d'environnement depuis .env
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── MIDDLEWARE ──
// Un middleware c'est du code qui s'exécute
// sur CHAQUE requête avant d'arriver à la route.
// Comme un garde à l'entrée d'un bâtiment.

// CORS = autorise le frontend (localhost:5174)
// à parler à ce backend (localhost:3001)
// Sans ça, le navigateur bloque les requêtes.
app.use(cors({
  origin: [
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
}))

// Permet de lire du JSON dans les requêtes
app.use(express.json())

// ── ROUTES ──
// Chaque route est un "préfixe" d'URL.
// /api/devto    → gère tout ce qui commence par /api/devto
// /api/github   → gère tout ce qui commence par /api/github
// etc.
app.use('/api/devto',      devtoRoutes)
app.use('/api/github',     githubRoutes)
app.use('/api/hackernews', hackernewsRoutes)

// Route de santé — pour vérifier que le serveur tourne
// Va sur http://localhost:3001/api/health pour tester
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CodePulse API is running',
    timestamp: new Date().toISOString()
  })
})

// Démarre le serveur sur le port 3001
app.listen(PORT, () => {
  console.log(`✅ CodePulse API → http://localhost:${PORT}`)
})