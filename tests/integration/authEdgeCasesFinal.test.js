const { describe, it, expect, beforeEach, vi } = require('vitest')
const request = require('supertest')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

describe('Edge Cases Final: refresh/logout edge behavior', () => {
  let app
  const email = 'edgefinal@example.com'
  const password = 'edgefinal'
  const mockUser = {
    id: 777,
    email,
    passwordHash: 'hash',
    emailVerified: true,
    twoFactorEnabled: false,
    company: { id: 777, name: 'EdgeFinal', subscriptionTier: 'STARTER', onboardingCompleted: true },
  }

  beforeEach(() => {
    const mockDb = {
      user: {
        findUnique: vi.fn().mockImplementation((args) => {
          if (args?.where?.email === email) return mockUser
          return null
        }),
        update: vi.fn().mockResolvedValue(true),
      },
      $disconnect: async () => {},
    }
    const path = require.resolve('../../backend/db.js')
    require.cache[path] = { exports: mockDb }
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    vi.spyOn(jwt, 'sign').mockImplementation((p) => 'EDGE_FINAL_TOKEN')
    const authRoutes = require('../../backend/routes/auth')
    app = express()
    app.use(express.json())
    app.use('/api/auth', authRoutes)
  })

  it('refresh without cookie -> 401', async () => {
    await request(app).post('/api/auth/refresh').expect(401)
  })
  it('refresh with invalid cookie -> 401', async () => {
    await request(app).post('/api/auth/refresh').set('Cookie', 'refreshToken=invalid').expect(401)
  })
  it('logout with cookie -> 200', async () => {
    await request(app).post('/api/auth/logout').set('Cookie', 'refreshToken=abc').expect(200)
  })
})
