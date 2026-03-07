import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FlagProvider } from './context/FlagContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Login from './pages/Login';
import Register from './pages/Register'; // Added Register import
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Notifications from './pages/Notifications';
import FounderHQ from './pages/FounderHQ';

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <FlagProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />
                {/* Legal Pages */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/refund" element={<Refund />} />
              </Route>

              {/* Auth Routes (No navigation bar) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Onboarding Flow */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute allowIncomplete={true}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Routes — Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="reports" element={<Reports />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                {/* Admin-only Routes */}
                <Route path="team" element={<AdminRoute><Team /></AdminRoute>} />
                <Route path="activity" element={<AdminRoute><Activity /></AdminRoute>} />
                <Route path="founder-hq" element={<AdminRoute><FounderHQ /></AdminRoute>} />
                <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
                <Route path="billing" element={<AdminRoute><Billing /></AdminRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FlagProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
