import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TradingProvider } from './contexts/TradingContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// ─── Lazy-loaded pages ──────────
// Public pages
const Landing        = lazy(() => import('./pages/Landing'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));

// Protected pages
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const TradingPage     = lazy(() => import('./pages/TradingPage'));
const AIMentor        = lazy(() => import('./pages/AIMentor'));
const StrategyBuilder = lazy(() => import('./pages/StrategyBuilder'));
const Screener        = lazy(() => import('./pages/Screener'));
const MarketReplay    = lazy(() => import('./pages/MarketReplay'));

// ─── Full-screen page loader skeleton ─────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(16, 185, 129, 0.15)',
        borderTop: '3px solid #10B981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        color: '#0F172A',
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
            <TradingProvider>
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

                    {/* Protected Routes (require login) */}
                    <Route path="/dashboard"         element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                    <Route path="/trading"           element={<PrivateRoute><Layout><TradingPage /></Layout></PrivateRoute>} />
                    <Route path="/trade"             element={<Navigate to="/trading" replace />} />
                    <Route path="/paper-trading"     element={<Navigate to="/trading" replace />} />

                    {/* Unlocked Platform Tools Routes */}
                    <Route path="/ai-mentor"         element={<PrivateRoute><Layout><AIMentor /></Layout></PrivateRoute>} />
                    <Route path="/mentor"            element={<Navigate to="/ai-mentor" replace />} />
                    <Route path="/strategy-builder"  element={<PrivateRoute><Layout><StrategyBuilder /></Layout></PrivateRoute>} />
                    <Route path="/strategy-lab"      element={<Navigate to="/strategy-builder" replace />} />
                    <Route path="/screener"          element={<PrivateRoute><Layout><Screener /></Layout></PrivateRoute>} />
                    <Route path="/markets"           element={<Navigate to="/screener" replace />} />
                    <Route path="/replay"            element={<PrivateRoute><Layout><MarketReplay /></Layout></PrivateRoute>} />
                    <Route path="/market-replay"     element={<Navigate to="/replay" replace />} />
                    
                    {/* Redirect anything else to Dashboard if logged in, or Landing if not */}
                    <Route path="*"                  element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </TradingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;