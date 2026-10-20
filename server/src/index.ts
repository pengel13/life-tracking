import express from 'express'
import { requireAuth } from './middleware/auth.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use('/api/auth', authRouter)

// Cards router mounted here — implemented in Task 4
app.get('/api/cards', requireAuth, (_req, res) => {
  res.json([])
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
