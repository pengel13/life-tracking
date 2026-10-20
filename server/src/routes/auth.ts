import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../lib/db.js'

const router = Router()

router.get('/status', async (_req, res) => {
  const auth = await db.auth.findUnique({ where: { id: 'singleton' } })
  res.json({ configured: !!auth })
})

router.post('/setup', async (req, res) => {
  const { password } = req.body
  if (!password) {
    res.status(400).json({ error: 'Password required' })
    return
  }
  const existing = await db.auth.findUnique({ where: { id: 'singleton' } })
  if (existing) {
    res.status(409).json({ error: 'Already set up' })
    return
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await db.auth.create({ data: { id: 'singleton', passwordHash } })
  const token = jwt.sign({ id: 'singleton' }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  res.json({ token })
})

router.post('/login', async (req, res) => {
  const { password } = req.body
  const auth = await db.auth.findUnique({ where: { id: 'singleton' } })
  if (!auth) {
    res.status(401).json({ error: 'Not set up' })
    return
  }
  const valid = await bcrypt.compare(password, auth.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid password' })
    return
  }
  const token = jwt.sign({ id: 'singleton' }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  res.json({ token })
})

export default router
