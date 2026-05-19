import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CandlestickBg from '../components/CandlestickBg';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpFallback, setOtpFallback] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'verify' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.success) {
      setOtpFallback(result.otpFallback || '');
      setStep('verify');
      setCountdown(600); // Reset countdown to 10 mins
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    setLoading(true);
    const result = await verifyEmail(email, otp);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.success) {
      setOtpFallback(result.otpFallback || '');
      setCountdown(600);
      toast.success('New OTP sent successfully!');
    }
  };

  return (
    <div className="auth-container">
      <CandlestickBg />
      
      {step === 'register' ? (
        <div className="auth-card" style={{ animation: 'fadeIn 0.5s ease' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', backgroundImage: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: '#9b9eac', fontSize: '14px', marginBottom: '24px', textAlign: 'center', marginTop: '0' }}>Get started with PricePulse</p>
          <form onSubmit={handleRegisterSubmit}>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p style={{ fontSize: '11px', marginTop: '-12px', marginBottom: '20px', color: '#9b9eac', textAlign: 'left', lineHeight: '1.4' }}>
              ⚠️ Password must be 8+ characters, with at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&amp;).
            </p>
            <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #00ff88, #00bcd4)', border: 'none', color: '#0a0e27', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <p style={{ marginTop: '20px', color: '#9b9eac' }}>Already have an account? <Link to="/login" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: '600' }}>Login</Link></p>
        </div>
      ) : (
        <div className="auth-card" style={{ animation: 'fadeIn 0.5s ease', border: '1px solid rgba(0, 188, 212, 0.4)' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', backgroundImage: 'linear-gradient(135deg, #00bcd4, #00ff88)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', marginBottom: '8px' }}>Verify Your Email</h2>
          <p style={{ color: '#9b9eac', fontSize: '14px', marginBottom: '24px', textAlign: 'center', marginTop: '0', lineHeight: '1.5' }}>
            We've sent a 6-digit verification code to <br />
            <strong style={{ color: '#ffffff', wordBreak: 'break-all' }}>{email}</strong>
          </p>
          
          <form onSubmit={handleVerifySubmit}>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '22px', fontWeight: 'bold', padding: '14px' }}
              required 
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '20px', color: '#9b9eac' }}>
              <span>Code expires in: <strong style={{ color: countdown < 60 ? '#ff4444' : '#00ff88' }}>{formatTime(countdown)}</strong></span>
              <button 
                type="button" 
                onClick={handleResendOtp} 
                disabled={loading || countdown > 540} 
                style={{ width: 'auto', background: 'none', border: 'none', color: countdown > 540 ? '#4c505c' : '#00ff88', cursor: countdown > 540 ? 'not-allowed' : 'pointer', padding: 0, margin: 0, fontWeight: '600' }}
              >
                Resend Code
              </button>
            </div>

            <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #00bcd4, #00ff88)', border: 'none', color: '#0a0e27', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => setStep('register')} 
              style={{ background: 'none', border: 'none', color: '#9b9eac', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
            >
              Back to Registration
            </button>
          </div>

          <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.15)', borderRadius: '10px', fontSize: '11.5px', color: '#ff4444', lineHeight: '1.4', textAlign: 'left' }}>
            ✉️ <strong>No email arriving?</strong> Brevo SMTP may block delivery if your current IP is not authorized in your Brevo account dashboard (under Settings &gt; Security &gt; Authorized IPs). Please check your Brevo settings.
          </div>

          {otpFallback && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0, 255, 136, 0.08)', border: '1px dashed rgba(0, 255, 136, 0.3)', borderRadius: '10px', fontSize: '12px', color: '#00ff88', textAlign: 'center' }}>
              🔧 <strong>Dev Mode Fallback:</strong> your OTP is <strong style={{ fontSize: '14px', letterSpacing: '1px' }}>{otpFallback}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}