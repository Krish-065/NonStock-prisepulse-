import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [otp, setOtp] = useState('');

  const [agreed, setAgreed] = useState(false);

  const { register, verifyEmail, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions first.');
      return;
    }
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('You must agree to the Terms & Conditions to register.');
      return;
    }
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.success) {
      if (result.requiresVerification) {
        setRequiresVerification(true);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await verifyEmail(email, otp);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px' }}>
      
      <div style={{ background: '#FFFFFF', padding: '48px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <Logo size={50} showName={true} showTagline={false} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>
          {requiresVerification ? 'Verify Email' : 'Create Account'}
        </h2>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
          {requiresVerification ? 'Enter the OTP sent to your email' : 'Join the proving ground'}
        </p>
        
        {!requiresVerification ? (
          <form onSubmit={handleRegisterSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#0F172A', width: '100%', outline: 'none' }}
            />
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
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: '#3B82F6', flexShrink: 0, marginTop: '2px' }} />
              <span>Must be 8+ characters (uppercase, lowercase, number, special char).</span>
            </p>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '8px 0' }}>
              <input 
                type="checkbox" 
                id="termsCheckbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                required 
                style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px', accentColor: '#10B981' }}
              />
              <label htmlFor="termsCheckbox" style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', cursor: 'pointer' }}>
                I agree to the <Link to="/terms" style={{ color: '#10B981', textDecoration: 'underline', fontWeight: '600' }}>Terms</Link> and understand this is a simulated paper trading platform.
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Enter OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: '800', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', width: '100%' }}
            />
            <button 
              type="submit" 
              disabled={loading} 
              style={{ background: '#10B981', border: 'none', color: '#FFFFFF', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}
        
        {!requiresVerification && (
          <>
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
                text="signup_with"
              />
            </div>

            <p style={{ color: '#475569', fontSize: '14px' }}>Already have an account? <Link to="/login" style={{ color: '#10B981', textDecoration: 'none', fontWeight: '700' }}>Log In</Link></p>
          </>
        )}
      </div>
    </div>
  );
}