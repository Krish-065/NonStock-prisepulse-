import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isEnabled, setIsEnabled] = useState(user?.two_factor_enabled || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      apiClient.get('/auth/2fa/setup')
        .then(res => {
          setQrCode(res.data.qrCode);
          setSecret(res.data.secret);
        })
        .catch(err => {
          console.error('Failed to load 2FA setup details', err);
        });
    }
  }, [isEnabled]);

  // Keep state sync with user object
  useEffect(() => {
    if (user) {
      setIsEnabled(user.two_factor_enabled);
    }
  }, [user]);

  const verifyAndEnable = async (e) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      return toast.error('Please enter a valid 6-digit code');
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/2fa/verify', { token });
      toast.success('Two-factor authentication enabled successfully!');
      setIsEnabled(true);
      setToken('');
      // Force refresh user profile
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid 2FA code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      return toast.error('Please enter the 6-digit code to disable 2FA');
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/2fa/disable', { token });
      toast.success('Two-factor authentication disabled successfully.');
      setIsEnabled(false);
      setToken('');
      // Force refresh user profile
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid 2FA code. Unable to disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 0', padding: '0 20px', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <span style={{ fontSize: '32px' }}>🔒</span>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            Security Settings
          </h1>
          <p style={{ color: '#9b9eac', fontSize: '14px', marginTop: '4px' }}>Protect your account with Two-Factor Authentication</p>
        </div>
      </div>

      <div style={{ background: 'rgba(30, 34, 45, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 136, 0.15)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Google Authenticator (2FA)</h3>
            <p style={{ color: '#9b9eac', fontSize: '13px', marginTop: '4px', maxWidth: '450px' }}>
              Enforces a secure, secondary verification code from your authenticator app every time you log in.
            </p>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: isEnabled ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)', color: isEnabled ? '#00ff88' : '#ff4444', border: `1px solid ${isEnabled ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'}` }}>
            {isEnabled ? '● Enabled' : '○ Disabled'}
          </span>
        </div>

        {isEnabled ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
            <h4 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>Your Account is Protected</h4>
            <p style={{ color: '#9b9eac', fontSize: '14px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Two-factor authentication is active on your account. To deactivate or disable it, enter a 6-digit authentication code from your app below:
            </p>
            
            <form onSubmit={handleDisable2FA} style={{ maxWidth: '360px', margin: '0 auto' }}>
              <input 
                type="text" 
                placeholder="000000" 
                value={token} 
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ width: '100%', padding: '12px', textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold', background: 'rgba(10, 14, 39, 0.5)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '10px', color: '#ffffff', marginBottom: '16px' }}
                required 
              />
              <button 
                type="submit" 
                disabled={loading} 
                style={{ width: '100%', padding: '14px', background: 'rgba(255, 68, 68, 0.2)', border: '1px solid #ff4444', borderRadius: '10px', color: '#ff4444', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>Setup Guide:</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                <p style={{ color: '#9b9eac', fontSize: '13px', lineHeight: '1.4' }}>
                  Download and install an authenticator app like <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> on your phone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                <p style={{ color: '#9b9eac', fontSize: '13px', lineHeight: '1.4' }}>
                  Scan the QR code displayed on the right, or manually type the secret key into your authenticator app.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                <p style={{ color: '#9b9eac', fontSize: '13px', lineHeight: '1.4' }}>
                  Enter the 6-digit verification code generated by your authenticator app into the confirmation box and click Enable.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '16px', background: 'rgba(10, 14, 39, 0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {qrCode ? (
                <div style={{ padding: '12px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <img src={qrCode} alt="Google Authenticator QR Code" style={{ display: 'block', width: '160px', height: '160px' }} />
                </div>
              ) : (
                <div style={{ width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b9eac', fontSize: '13px' }}>
                  Loading QR Code...
                </div>
              )}
              
              <div style={{ width: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', letterSpacing: '1px' }}>Manual Secret Key</span>
                <div style={{ background: 'rgba(10, 14, 39, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.1)', color: '#00ff88', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700', marginTop: '6px', letterSpacing: '1px', userSelect: 'all' }}>
                  {secret || 'Loading...'}
                </div>
              </div>

              <form onSubmit={verifyAndEnable} style={{ width: '100%' }}>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ width: '100%', padding: '12px', textAlign: 'center', letterSpacing: '4px', fontSize: '16px', fontWeight: 'bold', background: 'rgba(10, 14, 39, 0.5)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '10px', color: '#ffffff', marginBottom: '12px' }}
                  required 
                />
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #00ff88, #00bcd4)', border: 'none', borderRadius: '10px', color: '#0a0e27', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {loading ? 'Enabling...' : 'Enable 2FA'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}