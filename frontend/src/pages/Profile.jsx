import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 50px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, #0f1635 0%, #070a1e 100%);
  padding: 32px;
  border-radius: 16px;
  border: 1px solid rgba(0, 255, 136, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88, #00bcd4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  color: #0a0e27;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  text-transform: uppercase;
`;

const HeaderInfo = styled.div`
  flex: 1;

  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
  }

  p {
    margin: 6px 0 0 0;
    color: #9b9eac;
    font-size: 15px;
  }

  .badges {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
  }
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  background: ${props => props.type === 'primary' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 188, 212, 0.1)'};
  color: ${props => props.type === 'primary' ? '#00ff88' : '#00bcd4'};
  border: 1px solid ${props => props.type === 'primary' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 188, 212, 0.2)'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #0a0e27;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);

  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #9b9eac;
  }

  .value {
    color: #ffffff;
    font-weight: 600;
  }
`;

const QuickLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NavButton = styled.button`
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 255, 136, 0.08);
    border-color: rgba(0, 255, 136, 0.3);
    transform: translateY(-2px);
  }

  .icon {
    font-size: 18px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;

  input {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 12px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #00ff88;
      background: rgba(255, 255, 255, 0.04);
    }
  }

  button {
    background: linear-gradient(135deg, #00ff88, #00bcd4);
    border: none;
    color: #0a0e27;
    padding: 12px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 0 12px rgba(0, 255, 136, 0.4);
    }
  }
`;

const PreferenceGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;

  label {
    font-size: 13px;
    color: #9b9eac;
  }

  .options-row {
    display: flex;
    gap: 8px;
  }
`;

const PreferenceBtn = styled.button`
  flex: 1;
  padding: 10px;
  background: ${props => props.active ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.02)'};
  border: 1px solid ${props => props.active ? '#00ff88' : 'rgba(255,255,255,0.08)'};
  color: ${props => props.active ? '#00ff88' : '#e1e3e6'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255,255,255,0.05)'};
  }
`;

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Interactive Preferences
  const [baseCurrency, setBaseCurrency] = useState(() => localStorage.getItem('baseCurrency') || 'INR');
  const [refreshRate, setRefreshRate] = useState(() => localStorage.getItem('refreshRate') || '15s');
  const [landingPage, setLandingPage] = useState(() => localStorage.getItem('landingPage') || 'Dashboard');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all fields');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }
    
    // Simulate API call
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Updating password...',
        success: 'Password updated successfully!',
        error: 'Error updating password.'
      }
    );

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCurrencyChange = (curr) => {
    setBaseCurrency(curr);
    localStorage.setItem('baseCurrency', curr);
    toast.success(`Base Currency updated to ${curr}`);
  };

  const handleRefreshChange = (rate) => {
    setRefreshRate(rate);
    localStorage.setItem('refreshRate', rate);
    toast.success(`Data refresh rate set to ${rate}`);
  };

  const handleLandingPageChange = (e) => {
    const page = e.target.value;
    setLandingPage(page);
    localStorage.setItem('landingPage', page);
    toast.success(`Default landing page set to ${page}`);
  };

  const userInitial = user?.name ? user.name.charAt(0) : (user?.email ? user.email.charAt(0) : 'U');

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>{userInitial}</Avatar>
        <HeaderInfo>
          <h2>{user?.name || 'Investor Profile'}</h2>
          <p>{user?.email || 'investor@prisepulse.com'}</p>
          <div className="badges">
            <Badge type="primary">✓ KYC Verified</Badge>
            <Badge type="secondary">Pro Account</Badge>
          </div>
        </HeaderInfo>
        <div>
          <button 
            onClick={logout} 
            style={{ padding: '12px 24px', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid rgba(255, 51, 102, 0.3)', color: '#ff3366', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.target.style.background = '#ff3366'; e.target.style.color = '#0a0e27'; }}
            onMouseOut={(e) => { e.target.style.background = 'rgba(255, 51, 102, 0.1)'; e.target.style.color = '#ff3366'; }}
          >
            Logout Account
          </button>
        </div>
      </ProfileHeader>

      <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card>
            <h3>👤 Personal & Account Details</h3>
            <InfoRow>
              <span className="label">Full Name</span>
              <span className="value">{user?.name || 'Investor'}</span>
            </InfoRow>
            <InfoRow>
              <span className="label">Registered Email</span>
              <span className="value">{user?.email || 'investor@prisepulse.com'}</span>
            </InfoRow>
            <InfoRow>
              <span className="label">KYC Verification Status</span>
              <span className="value" style={{ color: '#00ff88' }}>Verified</span>
            </InfoRow>
            <InfoRow>
              <span className="label">Account ID</span>
              <span className="value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user?.id || 'PP-829104-X'}</span>
            </InfoRow>
            <InfoRow>
              <span className="label">Member Since</span>
              <span className="value">June 2026</span>
            </InfoRow>
          </Card>

          <Card>
            <h3>📊 Demat & Brokerage Details</h3>
            <InfoRow>
              <span className="label">Broker Code / Client Code</span>
              <span className="value">PRP065</span>
            </InfoRow>
            <InfoRow>
              <span className="label">Demat BO ID</span>
              <span className="value" style={{ fontFamily: 'monospace' }}>1208160001094852</span>
            </InfoRow>
            <InfoRow>
              <span className="label">DP Name</span>
              <span className="value">PricePulse Securities Pvt Ltd</span>
            </InfoRow>
            <InfoRow>
              <span className="label">PAN ID</span>
              <span className="value" style={{ fontFamily: 'monospace' }}>ABCDE*****F</span>
            </InfoRow>
            <InfoRow>
              <span className="label">Brokerage Plan</span>
              <span className="value" style={{ color: '#00bcd4' }}>₹0 Equity Delivery / ₹20 F&O Intraday</span>
            </InfoRow>
          </Card>

          <Card>
            <h3>⚙️ App Preferences</h3>
            <PreferenceGroup>
              <label>Default Launch Page</label>
              <select 
                value={landingPage} 
                onChange={handleLandingPageChange}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px', color: '#ffffff', outline: 'none' }}
              >
                <option value="Dashboard" style={{ background: '#0a0e27' }}>Dashboard</option>
                <option value="Watchlist" style={{ background: '#0a0e27' }}>Watchlist</option>
                <option value="Screener" style={{ background: '#0a0e27' }}>Stock Screener</option>
                <option value="IPOs" style={{ background: '#0a0e27' }}>IPO Center</option>
              </select>
            </PreferenceGroup>

            <PreferenceGroup>
              <label>Display & Pricing Currency</label>
              <div className="options-row">
                <PreferenceBtn active={baseCurrency === 'INR'} onClick={() => handleCurrencyChange('INR')}>INR (₹)</PreferenceBtn>
                <PreferenceBtn active={baseCurrency === 'USD'} onClick={() => handleCurrencyChange('USD')}>USD ($)</PreferenceBtn>
                <PreferenceBtn active={baseCurrency === 'EUR'} onClick={() => handleCurrencyChange('EUR')}>EUR (€)</PreferenceBtn>
              </div>
            </PreferenceGroup>

            <PreferenceGroup>
              <label>Market Data Poll Interval</label>
              <div className="options-row">
                <PreferenceBtn active={refreshRate === '5s'} onClick={() => handleRefreshChange('5s')}>Fast (5s)</PreferenceBtn>
                <PreferenceBtn active={refreshRate === '15s'} onClick={() => handleRefreshChange('15s')}>Normal (15s)</PreferenceBtn>
                <PreferenceBtn active={refreshRate === '30s'} onClick={() => handleRefreshChange('30s')}>Slow (30s)</PreferenceBtn>
              </div>
            </PreferenceGroup>
          </Card>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card>
            <h3>🔗 Quick Links</h3>
            <QuickLinks>
              <NavButton onClick={() => navigate('/portfolio')}>
                <span>📁 Go to Portfolio</span>
                <span className="icon">→</span>
              </NavButton>
              <NavButton onClick={() => navigate('/watchlist')}>
                <span>⭐ Go to Watchlist</span>
                <span className="icon">→</span>
              </NavButton>
              <NavButton onClick={() => navigate('/screener')}>
                <span>🔍 Go to Screener</span>
                <span className="icon">→</span>
              </NavButton>
            </QuickLinks>
          </Card>

          <Card>
            <h3>🔑 Change Password</h3>
            <Form onSubmit={handlePasswordChange}>
              <input 
                type="password" 
                placeholder="Current Password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="submit">Update Password</button>
            </Form>
          </Card>

          <Card>
            <h3>⚡ System Diagnostics</h3>
            <InfoRow>
              <span className="label">Server Link</span>
              <span className="value" style={{ color: '#00ff88' }}>Connected</span>
            </InfoRow>
            <InfoRow>
              <span className="label">Feed Source</span>
              <span className="value">Yahoo Finance</span>
            </InfoRow>
            <InfoRow>
              <span className="label">WebSockets</span>
              <span className="value">Inactive (Polling Active)</span>
            </InfoRow>
            <InfoRow>
              <span className="label">App Version</span>
              <span className="value">v2.4.0 (Stable)</span>
            </InfoRow>
          </Card>

        </div>
      </Grid>
    </ProfileContainer>
  );
}
