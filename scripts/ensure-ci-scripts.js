#!/usr/bin/env node
// Ensure CI script hooks exist in package.json
const fs = require('fs')
const path = require('path')

const pkgPath = path.resolve(__dirname, '..', 'package.json')
let pkg
try {
  const content = fs.readFileSync(pkgPath, 'utf8')
  pkg = JSON.parse(content)
} catch (e) {
  console.error('Failed to read package.json:', e)
  process.exit(1)
}

if (!pkg.scripts) pkg.scripts = {}
if (!pkg.scripts['start:ci'] || !pkg.scripts['start:ci'].includes('ci-serve.js')) {
  pkg.scripts['start:ci'] = 'node scripts/ci-serve.js'
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('Updated package.json with start:ci script')
} else {
  console.log('start:ci script already present')
}
