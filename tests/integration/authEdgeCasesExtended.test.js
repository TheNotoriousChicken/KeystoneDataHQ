const { describe, it, expect, beforeEach, vi } = require('vitest')
const request = require('supertest')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

describe('Edge Cases Extended: /refresh and /logout (no cookie, invalid, etc.)', () => {
  let app
  const email = 'edge2@example.com'
  const password = 'edgepass'
  const mockUser = {
    id: 100,
    email,
    passwordHash: 'hash',
    emailVerified: true,
    twoFactorEnabled: false,
    company: { id: 100, name: 'EdgeDash', subscriptionTier: 'STARTER', onboardingCompleted: true },
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
    vi.spyOn(jwt, 'sign').mockImplementation((p) => 'EDGE_TOKEN')
    const authRoutes = require('../../backend/routes/auth')
    app = express()
    app.use(express.json())
    app.use('/api/auth', authRoutes)
  })

  it('refresh with missing cookie -> 401', async () => {
    await request(app).post('/api/auth/refresh').expect(401)
  })

  it('refresh with invalid signature -> 401', async () => {
    // Send a cookie with an obviously invalid token
    const res = await request(app).post('/api/auth/refresh').set('Cookie', 'refreshToken=invalidtoken').expect(401)
  })

  it('logout without cookie -> 200', async () => {
    await request(app).post('/api/auth/logout').expect(200)
  })
})
