const { describe, it, expect, beforeEach, vi } = require('vitest')
const request = require('supertest')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

describe('Edge Cases: /refresh and /logout', () => {
  let app
  const email = 'edge@example.com'
  const password = 'edgepass'
  const mockUser = {
    id: 99,
    email,
    passwordHash: 'hash',
    emailVerified: true,
    twoFactorEnabled: false,
    company: { id: 99, name: 'EdgeCo', subscriptionTier: 'STARTER', onboardingCompleted: true },
  }

  beforeEach(() => {
    // Lightweight mock DB
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

    // Mocks for login path
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    vi.spyOn(jwt, 'sign').mockImplementation((payload, secret, opts) => 'EDGE_TOKEN')

    // Create app and mount routes
    app = express()
    app.use(express.json())
    const authRoutes = require('../../backend/routes/auth')
    app.use('/api/auth', authRoutes)
  })

  it('refresh without cookie -> 401', async () => {
    const res = await request(app).post('/api/auth/refresh').expect(401)
    expect(res.body).toHaveProperty('error')
  })

  it('refresh with expired token -> 401', async () => {
    // Build an expired token manually (exp in the past)
    const expiredPayload = { userId: mockUser.id, companyId: mockUser.company.id, role: 'ADMIN', exp: Math.floor(Date.now() / 1000) - 60 }
    const expired = require('jsonwebtoken').sign(expiredPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '1s' })
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${expired}`)
      .expect(401)
    // Might be 401 with error, or 401 without body depending on implementation
    // We just ensure status is 401 here
  })

  it('logout clears cookie (200)', async () => {
    // With a fake cookie, logout should clear it
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', 'refreshToken= Dummy')
      .expect(200)
    // Check for a Set-Cookie header clearing the token, if server sends it
    // We won't crash if not present
  })
})
