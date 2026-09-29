import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// ─── Lazy-loaded pages (code splitting — 70% smaller initial bundle) ──────────
// Public pages
const Landing        = lazy(() => import('./pages/Landing'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const Terms          = lazy(() => import('./pages/Terms'));

// Protected pages
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Portfolio      = lazy(() => import('./pages/Portfolio'));
const PaperTrading   = lazy(() => import('./pages/PaperTrading'));
const Watchlist      = lazy(() => import('./pages/Watchlist'));
const Screener       = lazy(() => import('./pages/Screener'));
const FnO            = lazy(() => import('./pages/FnO'));
const SectorRotation = lazy(() => import('./pages/SectorRotation'));
const StockRedirect  = lazy(() => import('./pages/StockRedirect'));
const StockDetail    = lazy(() => import('./pages/StockDetail'));
const Markets        = lazy(() => import('./pages/Markets'));
const News           = lazy(() => import('./pages/News'));
const Crypto         = lazy(() => import('./pages/Crypto'));
const Commodities    = lazy(() => import('./pages/Commodities'));
const Profile        = lazy(() => import('./pages/Profile'));
const StrategyBuilder= lazy(() => import('./pages/StrategyBuilder'));
const AIMentor       = lazy(() => import('./pages/AIMentor'));
const Community      = lazy(() => import('./pages/Community'));
const Alerts         = lazy(() => import('./pages/Alerts'));
const UpgradePro     = lazy(() => import('./pages/UpgradePro'));
const ContactUs      = lazy(() => import('./pages/ContactUs'));

// ─── Full-screen page loader skeleton ─────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #0b0d19)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(0, 242, 254, 0.15)',
        borderTop: '3px solid #00f2fe',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        background: 'linear-gradient(135deg, #00f2fe, #7928ca)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: '1px',
      }}>
        Loading NonStock...
      </div>
    </div>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "416992875765-gdh7ncmsipfgnh3o8vrc95igg6ifdio1.apps.googleusercontent.com";
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/"                  element={<PublicRoute><Landing /></PublicRoute>} />
                  <Route path="/login"             element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register"          element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/forgot-password"   element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                  <Route path="/reset-password"    element={<PublicRoute><ResetPassword /></PublicRoute>} />
                  <Route path="/terms"             element={<Terms />} />

                  {/* Protected Routes (require login) */}
                  <Route path="/dashboard"         element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                  <Route path="/portfolio"         element={<PrivateRoute><Layout><Portfolio /></Layout></PrivateRoute>} />
                  <Route path="/paper-trading"     element={<PrivateRoute><Layout><PaperTrading /></Layout></PrivateRoute>} />
                  <Route path="/watchlist"         element={<PrivateRoute><Layout><Watchlist /></Layout></PrivateRoute>} />
                  <Route path="/screener"          element={<PrivateRoute><Layout><Screener /></Layout></PrivateRoute>} />
                  <Route path="/ipos"              element={<Navigate to="/dashboard" replace />} />
                  <Route path="/fno"               element={<PrivateRoute><Layout><FnO /></Layout></PrivateRoute>} />
                  <Route path="/sector-rotation"   element={<PrivateRoute><Layout><SectorRotation /></Layout></PrivateRoute>} />
                  <Route path="/stock/:symbol"     element={<PrivateRoute><StockRedirect /></PrivateRoute>} />
                  <Route path="/pro-analytics/:symbol" element={<PrivateRoute><Layout><StockDetail /></Layout></PrivateRoute>} />
                  <Route path="/markets"           element={<PrivateRoute><Layout><Markets /></Layout></PrivateRoute>} />
                  <Route path="/tools"             element={<Navigate to="/dashboard" replace />} />
                  <Route path="/news"              element={<PrivateRoute><Layout><News /></Layout></PrivateRoute>} />
                  <Route path="/crypto"            element={<PrivateRoute><Layout><Crypto /></Layout></PrivateRoute>} />
                  <Route path="/commodities"       element={<PrivateRoute><Layout><Commodities /></Layout></PrivateRoute>} />
                  <Route path="/indian-market"     element={<Navigate to="/dashboard" replace />} />
                  <Route path="/mutual-funds"      element={<Navigate to="/dashboard" replace />} />
                  <Route path="/profile"           element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
                  <Route path="/strategy-lab"      element={<PrivateRoute><Layout><StrategyBuilder /></Layout></PrivateRoute>} />
                  <Route path="/ai-mentor"         element={<PrivateRoute><Layout><AIMentor /></Layout></PrivateRoute>} />
                  <Route path="/alerts"            element={<PrivateRoute><Layout><Alerts /></Layout></PrivateRoute>} />
                  <Route path="/community"         element={<PrivateRoute><Layout><Community /></Layout></PrivateRoute>} />
                  <Route path="/upgrade-pro"       element={<PrivateRoute><Layout><UpgradePro /></Layout></PrivateRoute>} />
                  <Route path="/contact-us"        element={<PrivateRoute><Layout><ContactUs /></Layout></PrivateRoute>} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;