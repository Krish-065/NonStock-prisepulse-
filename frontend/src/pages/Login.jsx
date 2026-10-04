import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import CelestialEngine from '../components/CelestialEngine';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { login, verify2FALogin, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In failed');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      if (result.twoFactorRequired) {
        setTempToken(result.tempToken);
        setTwoFactorRequired(true);
        toast.success('Credentials verified. Please enter your 2FA code.');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      return toast.error('Please enter a valid 6-digit code');
    }
    setLoading(true);
    const result = await verify2FALogin(tempToken, twoFactorCode);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#F8FAFC', 
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Celestial Background (Rotating Earth & Orbiting Sun) */}
      <CelestialEngine mode="ambient" style={{ opacity: 0.28, zIndex: 0 }} />
      
      {!twoFactorRequired ? (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(16px)',
          border: '1.5px solid #E2E8F0',
          padding: '44px 40px', 
          borderRadius: '24px', 
          boxShadow: '0 20px 45px -10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)', 
          width: '100%', 
          maxWidth: '440px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ marginBottom: '28px' }}>
            <Logo size={46} showName={true} showTagline={false} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>Sign in to access your Terminal</p>
          
          <form onSubmit={handleLoginSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#0F172A', width: '100%', outline: 'none' }} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#0F172A', width: '100%', outline: 'none' }} 
            />
            <button 
              type="submit" 
              disabled={loading} 
              style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ margin: '24px 0', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
            <span style={{ margin: '0 12px', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
          </div>
          
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="100%"
              text="signin_with"
            />
          </div>

          <p style={{ color: '#475569', fontSize: '14px' }}>Don't have an account? <Link to="/register" style={{ color: '#10B981', textDecoration: 'none', fontWeight: '700' }}>Register</Link></p>
          <p style={{ marginTop: '12px' }}><Link to="/forgot-password" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Forgot Password?</Link></p>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', padding: '48px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #10B981' }}>
          <div style={{ marginBottom: '32px' }}>
            <Logo size={50} showName={true} showTagline={false} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>2FA Verification</h2>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '32px', textAlign: 'center', lineHeight: '1.5' }}>
            Enter the 6-digit code from your <br />
            <strong>Google Authenticator</strong> app.
          </p>
          
          <form onSubmit={handleTwoFactorSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="000000" 
              value={twoFactorCode} 
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '12px', fontSize: '28px', fontWeight: '800', padding: '16px', width: '100%', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A' }}
              required 
            />
            <button 
              type="submit" 
              disabled={loading} 
              style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => setTwoFactorRequired(false)} 
              style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
              &larr; Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}