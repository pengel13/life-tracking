import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

process.env.DATABASE_URL = 'file:./test.db'
process.env.JWT_SECRET = 'test-secret-key'

const testDb = new PrismaClient()

beforeEach(async () => {
  await testDb.auth.deleteMany()
  await testDb.card.deleteMany()
})

afterAll(async () => {
  await testDb.$disconnect()
})
