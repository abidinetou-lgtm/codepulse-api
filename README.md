# CodePulse API 🔧

**Backend Express pour CodePulse** — Serveur REST qui agrège les articles tech depuis Dev.to, Hacker News et NewsAPI, avec cache, rate limiting et headers de sécurité.

🌐 **Frontend** → [codepulse-rouge.vercel.app](https://codepulse-rouge.vercel.app)
🔧 **Health check** → [/api/health](https://codepulse-api-umun.onrender.com/api/health)

---

## Architecture

```
Navigateur (React)
      │
      │  GET /api/devto/articles?tag=react
      ▼
 Express Server (Render)
      │
      ├── Rate Limiter (60 req/min/IP)
      ├── CORS (domaines autorisés uniquement)
      ├── Headers sécurité (X-Frame-Options, XSS...)
      │
      ├── /api/devto      → Dev.to API publique
      ├── /api/hackernews → Hacker News Firebase API
      ├── /api/newsapi    → NewsAPI.org (clé requise)
      └── /api/health     → Status du serveur
            │
            ▼
         Cache mémoire (5-10 min)
         → évite de surcharger les APIs externes
```

---

## Stack technique

| Outil | Rôle |
|---|---|
| **Node.js** | Environnement d'exécution JavaScript côté serveur |
| **Express** | Framework serveur web — routes, middleware |
| **node-fetch** | Requêtes HTTP vers les APIs externes |
| **dotenv** | Chargement des variables d'environnement |
| **cors** | Gestion des permissions cross-origin |
| **Render** | Hébergement du serveur en production |

---

## Structure du projet

```
codepulse-api/
├── src/
│   ├── routes/
│   │   ├── devto.js          # GET /api/devto/articles
│   │   ├── hackernews.js     # GET /api/hackernews/top
│   │   └── newsapi.js        # GET /api/newsapi/articles
│   ├── services/
│   │   ├── devtoService.js       # Logique + nettoyage Dev.to
│   │   ├── hackerNewsService.js  # Logique + nettoyage HN
│   │   └── newsApiService.js     # Logique + validation NewsAPI
│   └── cache.js              # Cache mémoire avec TTL
├── server.js                 # Point d'entrée — config Express
├── .gitignore                # .env jamais commité
├── package.json
└── README.md
```

---

## Installation locale

### Prérequis
- Node.js v18+
- Une clé API [NewsAPI](https://newsapi.org) (gratuite)

### 1. Cloner le repo

```bash
git clone https://github.com/abidinetou-lgtm/codepulse-api.git
cd codepulse-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Crée un fichier `.env` à la racine :

```env
PORT=3001
NEWS_API_KEY=ta_cle_newsapi_ici
NODE_ENV=development
```

### 4. Démarrer

```bash
# Développement (auto-reload)
npm run dev

# Production
npm start
```

Le serveur tourne sur `http://localhost:3001`.

---

## Endpoints disponibles

### `GET /api/health`
Vérifie que le serveur tourne.

```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

---

### `GET /api/devto/articles`

Récupère les articles Dev.to.

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `tag` | string | `javascript` | Tag à filtrer |
| `limit` | number | `12` | Nombre d'articles (max 30) |

**Exemple :**
```
GET /api/devto/articles?tag=react&limit=20
```

**Réponse :**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": "devto_123",
      "source": "devto",
      "sourceLabel": "Dev.to",
      "title": "Maîtriser async/await",
      "desc": "Description...",
      "url": "https://dev.to/...",
      "cover": "https://media.dev.to/image.jpg",
      "tags": ["javascript", "react"],
      "meta": "347 réactions · 5 min",
      "author": "Nom Auteur"
    }
  ]
}
```

---

### `GET /api/hackernews/top`

Récupère les top stories Hacker News.

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `limit` | number | `12` | Nombre de stories (max 30) |

**Exemple :**
```
GET /api/hackernews/top?limit=15
```

---

### `GET /api/newsapi/articles`

Récupère les articles tech depuis NewsAPI.

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `q` | string | `tech news software` | Requête (liste blanche côté serveur) |
| `pageSize` | number | `15` | Nombre d'articles (5-20) |

**Requêtes autorisées (liste blanche) :**
- `javascript programming`
- `react javascript framework`
- `nodejs backend`
- `web development frontend`
- `artificial intelligence machine learning`

> Les requêtes hors liste blanche sont redirigées vers `tech news software`

---

## Sécurité

### Rate Limiting
```
60 requêtes / minute / IP
→ HTTP 429 si dépassé
```

### CORS
```javascript
// Seuls ces domaines peuvent appeler l'API
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // ... jusqu'à 5180
  'https://codepulse-rouge.vercel.app',
]
```

### Headers de sécurité
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
X-Powered-By: (supprimé)
```

### Validation des inputs
- Paramètre `q` de NewsAPI validé par liste blanche
- `pageSize` borné entre 5 et 20
- Stack traces jamais exposées en production

---

## Cache

```javascript
// TTL par source
Dev.to      → 5 minutes
HackerNews  → 5 minutes
NewsAPI     → 10 minutes (quota limité à 100 req/jour)
```

Le cache est en mémoire (Map JavaScript). Il se remet à zéro si le serveur redémarre.

---

## Déploiement Render

```yaml
Name:          codepulse-api
Language:      Node
Branch:        main
Build Command: npm install
Start Command: npm start
```

**Variables d'environnement à configurer sur Render :**

| Variable | Description |
|---|---|
| `PORT` | Port du serveur (Render le gère automatiquement) |
| `NEWS_API_KEY` | Ta clé NewsAPI |
| `NODE_ENV` | `production` |

> ⚠️ Le plan gratuit Render met le serveur en veille après 15 min d'inactivité.
> La première requête après une pause peut prendre 30-60 secondes (réveil du serveur).

---

## APIs externes utilisées

| API | Doc | Auth | Limite |
|---|---|---|---|
| [Dev.to](https://developers.forem.com/api) | Officielle | Aucune | Généreuse |
| [Hacker News](https://github.com/HackerNews/API) | Officielle | Aucune | Aucune |
| [NewsAPI](https://newsapi.org/docs) | Officielle | Clé API | 100 req/jour (gratuit) |

---

## Auteur

**Jimel Abidine Touré**

- 📧 [jimeltoure@gmail.com](mailto:jimeltoure@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/jimel-abidine-toure-56007139a)
- 🐙 [GitHub](https://github.com/abidinetou-lgtm)

---

## Licence

MIT — libre d'utilisation et de modification.