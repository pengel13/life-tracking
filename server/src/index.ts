import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from './middleware/auth.js'
import authRouter from './routes/auth.js'
import cardsRouter from './routes/cards.js'
import syncRouter from './routes/sync.js'
import { startSyncWorker } from './workers/syncWorker.js'

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/cards', requireAuth, cardsRouter)

// Callback must bypass requireAuth — Microsoft redirects here unauthenticated
app.get('/api/sync/accounts/callback', (req, res, next) => {
  syncRouter(req, res, next)
})
app.use('/api/sync', requireAuth, syncRouter)

if (process.env.NODE_ENV !== 'test') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const clientDist = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientDist))
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  startSyncWorker()
}

export default app

