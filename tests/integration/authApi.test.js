const { describe, it, expect, beforeEach, vi } = require('vitest')
const express = require('express')
const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

describe('Integration API: /api/auth/login', () => {
  let app
  const email = 'regular@example.com'
  const password = 'pass'
  const mockUser = {
    id: 1,
    email,
    passwordHash: 'hash',
    emailVerified: true,
    twoFactorEnabled: false,
    company: { id: 1, name: 'Acme', subscriptionTier: 'GROWTH', onboardingCompleted: true }
  }

  beforeEach(() => {
    // Mock the DB module used by the routes
    const mockDb = {
      user: {
        findUnique: (args) => {
          if (args?.where?.email === email) return mockUser
          return null
        },
        update: async () => true,
      },
      $disconnect: async () => {},
    }
    const path = require.resolve('../../backend/db.js')
    require.cache[path] = { exports: mockDb }

    // Mock bcrypt and jwt for predictable results
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    vi.spyOn(jwt, 'sign').mockImplementation((payload, secret, opts) => {
      return 'UNIT_TOKEN';
    });
    // Also mock refresh token generation to a deterministic value
    try {
      const refreshModule = require('../../backend/utils/refreshToken');
      vi.spyOn(refreshModule, 'generateRefreshToken').mockReturnValue('REFRESH_TOKEN');
    } catch (e) {
      // ignore if not loaded in this environment
    }

    // Create an express app and mount the routes
    app = express()
    app.use(express.json())
    const authRoutes = require('../../backend/routes/auth')
    app.use('/api/auth', authRoutes)
  })

  it('logs in existing user without 2FA and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)

    expect(res.body).toHaveProperty('token', 'UNIT_TOKEN')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.email).toBe(email)
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/)
  })

  it('returns 2FA APP path when 2FA is enabled', async () => {
    mockUser.twoFactorEnabled = true
    mockUser.twoFactorMethod = 'APP'

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)

    expect(res.body).toHaveProperty('requiresTwoFactor', true)
    expect(res.body).toHaveProperty('method', 'APP')
    expect(typeof res.body.tempToken).toBe('string')
  })
})
