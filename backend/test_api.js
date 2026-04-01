// Comprehensive API test script
require('dotenv/config');

const BASE = 'http://localhost:4000';

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${name}`, result ? `→ ${JSON.stringify(result).slice(0, 120)}` : '');
  } catch (err) {
    console.error(`❌ ${name} → ${err.message}`);
  }
}

async function run() {
  console.log('\n=== COMPREHENSIVE API TEST ===\n');

  // 1. Health Check
  await test('GET /api/health', async () => {
    const res = await fetch(`${BASE}/api/health`);
    return res.json();
  });

  // 2. Public endpoints
  await test('GET /api/flags', async () => {
    const res = await fetch(`${BASE}/api/flags`);
    return res.json();
  });

  await test('GET /api/broadcast/active', async () => {
    const res = await fetch(`${BASE}/api/broadcast/active`);
    return res.json();
  });

  // 3. Login
  let token = null;
  let userId = null;
  let companyId = null;

  await test('POST /api/auth/login', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@keystonedata.com', password: 'Test2026!' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    token = data.token;
    userId = data.user.id;
    companyId = data.user.company.id;
    return { user: data.user.email, company: data.user.company.name, tier: data.user.company.subscriptionTier };
  });

  if (!token) {
    console.error('\n⛔ Cannot proceed without a valid token. Aborting.\n');
    process.exit(1);
  }

  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 4. Profile
  await test('GET /api/auth/profile', async () => {
    const res = await fetch(`${BASE}/api/auth/profile`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { email: data.email, role: data.role, emailVerified: data.emailVerified };
  });

  // 5. Dashboard
  await test('GET /api/dashboard', async () => {
    const res = await fetch(`${BASE}/api/dashboard`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { hasMetrics: !!data.metrics, hasDeltas: !!data.deltas };
  });

  // 6. Reports
  await test('GET /api/reports', async () => {
    const res = await fetch(`${BASE}/api/reports`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { summary: data.summary ? 'present' : 'null', dailyCount: data.dailyMetrics?.length || 0 };
  });

  // 7. Settings
  await test('GET /api/settings', async () => {
    const res = await fetch(`${BASE}/api/settings`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { company: data.company?.name };
  });

  // 8. Team
  await test('GET /api/team', async () => {
    const res = await fetch(`${BASE}/api/team`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { members: data.members?.length, pendingInvites: data.pendingInvites?.length };
  });

  // 9. Notifications
  await test('GET /api/notifications', async () => {
    const res = await fetch(`${BASE}/api/notifications`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { count: data.notifications?.length, unread: data.unreadCount };
  });

  // 10. Activity
  await test('GET /api/activity', async () => {
    const res = await fetch(`${BASE}/api/activity`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { entries: data.activity?.length };
  });

  // 11. Integrations Status
  await test('GET /api/integrations/status', async () => {
    const res = await fetch(`${BASE}/api/integrations/status`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  });

  // 12. Billing Status
  await test('GET /api/billing/status', async () => {
    const res = await fetch(`${BASE}/api/billing/status`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { tier: data.subscription?.subscriptionTier, status: data.subscription?.subscriptionStatus };
  });

  // 13. Dashboard Sync (POST)
  await test('POST /api/dashboard/sync', async () => {
    const res = await fetch(`${BASE}/api/dashboard/sync`, { method: 'POST', headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { message: data.message };
  });

  // 14. Test 401 on protected route without token
  await test('GET /api/dashboard (no token → 401)', async () => {
    const res = await fetch(`${BASE}/api/dashboard`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    return { status: 401, message: 'Correctly rejected unauthenticated request' };
  });

  // 15. Test CORS preflight
  await test('OPTIONS /api/health (CORS preflight)', async () => {
    const res = await fetch(`${BASE}/api/health`, { method: 'OPTIONS' });
    return { status: res.status };
  });

  console.log('\n=== ALL TESTS COMPLETE ===\n');
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
