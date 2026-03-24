#!/usr/bin/env node
/*
  Lightweight CI server bootstrapper: starts backend and frontend, waits for readiness,
  runs tests, then shuts down.
*/
const { spawn } = require('child_process')
const path = require('path')

function log(prefix, ...args) {
  console.log(`[CI ${prefix}]`, ...args)
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts })
    p.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function main() {
  const root = process.cwd()
  // Step 1: build frontend
  log('CI', 'Building frontend...')
  await run('node', ['-v']); // ensure node is available
  await run('npm', ['run', 'build'], { cwd: path.resolve(root, 'frontend') })
  // Step 2: start backend
  log('CI', 'Starting backend...')
  const backend = spawn('node', ['server.js'], { cwd: path.resolve(root, 'backend'), stdio: 'inherit' })
  // Step 3: start frontend static server after build
  log('CI', 'Starting frontend static server...')
  const frontendServer = spawn('npx', ['http-server', 'dist', '-p', '5173'], { cwd: path.resolve(root, 'frontend'), stdio: 'inherit' })

  // Step 4: wait for readiness (backend up by checking /api/auth/login)
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const readyCheck = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'noone@local', password: 'x' }) })
      return res.ok || res.status === 401
    } catch {
      return false
    }
  }
  process.on('SIGINT', () => {
    try { backend.kill() } catch {}
    try { frontendServer.kill() } catch {}
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    try { backend.kill() } catch {}
    try { frontendServer.kill() } catch {}
    process.exit(0)
  })

  log('CI', 'Waiting for backend to be ready...')
  let ready = false
  for (let i = 0; i < 60; i++) {
    ready = await readyCheck()
    if (ready) break
    await sleep(1000)
  }
  if (!ready) {
    log('CI', 'Backend did not become ready in time')
    backend.kill()
    frontendServer.kill()
    process.exit(1)
  }
  log('CI', 'Backend ready, running tests...')

  // Step 5: run tests in sequence (unit, integration, e2e)
  try {
    await run('npm', ['run', 'test:unit'], {})
    await run('npm', ['run', 'test:integration'], {})
    // End-to-end tests (UI) – optional; controlled by RUN_UI env in tests
    await run('npm', ['run', 'test:e2e'], {})
  } catch (err) {
    console.error('CI tests failed:', err)
    backend.kill()
    frontendServer.kill()
    process.exit(1)
  }

  // Write a simple CI summary for quick triage
  const fs = require('fs')
  try {
    const summary = {
      unit: 'pass',
      integration: 'pass',
      e2e: 'pending',
      timestamp: new Date().toISOString()
    }
    fs.writeFileSync(path.resolve(process.cwd(), 'ci-summary.txt'), JSON.stringify(summary, null, 2))
  } catch {}

  // Cleanup
  log('CI', 'Tests finished. Shutting down servers...')
  try { backend.kill() } catch {}
  try { frontendServer.kill() } catch {}
  process.exit(0)
}

// Run the main flow
main().catch((e) => {
  console.error('CI bootstrap failed', e)
  process.exit(1)
})
