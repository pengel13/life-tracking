import express from 'express'
import { requireAuth } from './middleware/auth.js'
import authRouter from './routes/auth.js'
import cardsRouter from './routes/cards.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/cards', requireAuth, cardsRouter)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
