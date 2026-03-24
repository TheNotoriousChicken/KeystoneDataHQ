const { describe, it, expect, beforeEach, vi } = require('vitest')
const request = require('supertest')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

describe('Integration API: /api/auth/refresh and /api/auth/logout', () => {
  let app
  const email = 'regular@example.com'
  const password = 'pass'
  const mockUser = {
    id: 1,
    email,
    passwordHash: 'hash',
    emailVerified: true,
    twoFactorEnabled: false,
    company: { id: 1, name: 'Acme', subscriptionTier: 'GROWTH', onboardingCompleted: true },
  }

  beforeEach(() => {
    // Mock DB and auth stack
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

    // Mocks for login and token rotation
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    // Rotate tokens with a simple counter, or deterministic JWTs via stubbed secret
    let signCall = 0
    vi.spyOn(jwt, 'sign').mockImplementation((payload, secret, opts) => {
      signCall += 1
      return signCall === 1 ? 'AUTH_TOKEN' : 'NEW_AUTH_TOKEN'
    })

    // rotate refresh tokens deterministically using the real helper
    const rt = require('../../backend/utils/refreshToken')
    // Use real signing but with a version counter to rotate tokens deterministically
    let refreshVersion = 1
    rt.generateRefreshToken = vi.fn((payload) => {
      const payloadWithVersion = { ...payload, refreshVersion }
      refreshVersion++
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      return require('jsonwebtoken').sign(payloadWithVersion, secret, { expiresIn: '14d' })
    })

    // Create app
    app = express()
    app.use(express.json())
    const authRoutes = require('../../backend/routes/auth')
    app.use('/api/auth', authRoutes)
  })

  it('logs in then refreshes the token and rotates the refresh cookie', async () => {
    // 1) Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)
    expect(loginRes.body).toHaveProperty('token')
    // Cookie should be set for refreshToken
    const cookies = loginRes.headers['set-cookie'] || []
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='))
    expect(refreshCookie).toBeDefined()
    const refreshValue = refreshCookie.split(';')[0].split('=')[1]

    // 2) Refresh
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${refreshValue}`)
      .expect(200)
    expect(refreshRes.body).toHaveProperty('token')
    const newCookies = refreshRes.headers['set-cookie'] || []
    const newRefresh = newCookies.find((c) => c.startsWith('refreshToken='))
    expect(newRefresh).toBeDefined()
    // Verify rotation
    const newValue = newRefresh.split(';')[0].split('=')[1]
    expect(newValue).not.toBe(refreshValue)

    // 3) Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `refreshToken=${newValue}`)
      .expect(200)
    // Cookie cookie cleared
    const logoutCookies = logoutRes.headers['set-cookie'] || []
    const clearCookie = logoutCookies.find((c) => c.startsWith('refreshToken='))
    expect(clearCookie).toBeDefined()
  })
})
