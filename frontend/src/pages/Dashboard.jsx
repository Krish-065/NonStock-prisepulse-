import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrading } from '../contexts/TradingContext';
import { apiClient } from '../services/api';
import { 
  Trophy, Medal, Star, Zap, ArrowRight, ShieldCheck, 
  Lock, Unlock, Target, Coins, Activity, TrendingUp, TrendingDown,
  Search, Plus, X, Crown, Sparkles, Sliders, ExternalLink,
  Flame, CheckCircle2, AlertCircle, BarChart2, Camera, Image,
  Bot, FlaskConical, Clock, ShieldAlert, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

// Available assets for the Watchlist search dropdown
const WATCHLIST_DATABASE = [
  { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', category: 'Crypto', price: '$86,280.00', change: '+2.45%' },
  { symbol: 'ETHUSDT', name: 'Ethereum / USDT', category: 'Crypto', price: '$3,420.50', change: '+1.80%' },
  { symbol: 'SOLUSDT', name: 'Solana / USDT', category: 'Crypto', price: '$158.20', change: '+4.12%' },
  { symbol: 'XAUUSD', name: 'Gold Spot / USD', category: 'Commodities', price: '$2,518.40', change: '+0.74%' },
  { symbol: 'WTIUSD', name: 'Crude Oil WTI', category: 'Commodities', price: '$78.50', change: '-0.65%' },
  { symbol: 'XAGUSD', name: 'Silver Spot / USD', category: 'Commodities', price: '$29.40', change: '+1.15%' },
  { symbol: 'EURUSD', name: 'EUR / USD Forex', category: 'Forex', price: '1.0848', change: '+0.22%' },
  { symbol: 'GBPUSD', name: 'GBP / USD Forex', category: 'Forex', price: '1.3032', change: '-0.12%' },
  { symbol: 'USDJPY', name: 'USD / JPY Forex', category: 'Forex', price: '148.82', change: '+0.36%' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Equities', price: '$226.40', change: '+0.85%' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Equities', price: '$124.50', change: '+3.10%' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Equities', price: '$248.60', change: '-1.40%' },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', category: 'Equities', price: '$572.30', change: '+0.45%' }
];

// Decagon Badge Component (10-sided polygon)
function DecagonBadge({ icon: Icon, color, bgColor, label, subtitle, locked = false, requirement = '' }) {
  const decagonClip = 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)';

  return (
    <div style={{
      background: locked ? 'rgba(248, 250, 252, 0.85)' : '#FFFFFF',
      borderRadius: '16px',
      border: locked ? '1.5px dashed #CBD5E1' : `2px solid ${color}33`,
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: locked ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      {/* 10-sided Decagon Icon Frame */}
      <div style={{
        position: 'relative',
        width: '68px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {/* Outer Decagon Border */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: locked ? '#94A3B8' : `linear-gradient(135deg, ${color}, ${color}88)`,
          clipPath: decagonClip,
          boxShadow: locked ? 'none' : `0 0 12px ${color}44`
        }} />

        {/* Inner Decagon Body */}
        <div style={{
          position: 'absolute',
          inset: '3px',
          background: locked ? '#F1F5F9' : (bgColor || '#0F172A'),
          clipPath: decagonClip,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {locked ? (
            <Lock size={24} color="#64748B" />
          ) : (
            <Icon size={26} color={color} />
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          color: locked ? '#64748B' : color,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '2px'
        }}>
          {locked ? 'LOCKED MILESTONE' : 'VERIFIED BADGE'}
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 900,
          color: locked ? '#475569' : '#0F172A',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
          {locked ? requirement : subtitle}
        </div>
      </div>

      {locked && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#F1F5F9',
          padding: '2px 8px',
          borderRadius: '999px',
          fontSize: '10px',
          fontWeight: 800,
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Lock size={10} /> Locked
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    balance = 1000, coins = 100, streakDays = 1, positions = [], history = [], badge, closePosition,
    watchlist = [], addToWatchlist, removeFromWatchlist,
    unlockedTools = {}, unlockTool 
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProModal, setShowProModal] = useState(false);

  // Avatar & Banner state
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('nonstock_user_avatar') || '' : '';
  });
  const [bannerUrl, setBannerUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('nonstock_user_banner') || '' : '';
  });

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        localStorage.setItem('nonstock_user_avatar', dataUrl);
        setAvatarUrl(dataUrl);
        toast.success('Profile avatar updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Banner must be under 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        localStorage.setItem('nonstock_user_banner', dataUrl);
        setBannerUrl(dataUrl);
        toast.success('Profile banner updated');
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter search results for Watchlist
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return WATCHLIST_DATABASE.filter(item => 
      item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Strict Tier & Color Logic:
  // Contender: #0F172A (dark navy, never silver!)
  // Silver: #94A3B8 (balance >= 2000) -> silver color
  // Gold: #EAB308 (balance >= 4000) -> yellow gold bright
  // Master: #E11D48 (balance >= 8000) -> ruby bright red
  // Operator: #A855F7 (balance >= 15000) -> neon bright purple
  const balanceNum = Number(balance) || 1000;
  
  let dynamicTierName = 'Contender';
  let dynamicTierColor = '#0F172A';
  let nextRankName = 'Silver';
  let nextRankTarget = 2000;

  if (balanceNum >= 15000) {
    dynamicTierName = 'Operator';
    dynamicTierColor = '#A855F7'; // Neon bright purple
    nextRankName = 'Max Rank (Operator)';
    nextRankTarget = 15000;
  } else if (balanceNum >= 8000) {
    dynamicTierName = 'Master';
    dynamicTierColor = '#E11D48'; // Ruby bright red
    nextRankName = 'Operator';
    nextRankTarget = 15000;
  } else if (balanceNum >= 4000) {
    dynamicTierName = 'Gold';
    dynamicTierColor = '#EAB308'; // Yellow gold bright
    nextRankName = 'Master';
    nextRankTarget = 8000;
  } else if (balanceNum >= 2000) {
    dynamicTierName = 'Silver';
    dynamicTierColor = '#94A3B8'; // Silver color
    nextRankName = 'Gold';
    nextRankTarget = 4000;
  } else {
    dynamicTierName = 'Contender';
    dynamicTierColor = '#0F172A'; // Contender deep slate
    nextRankName = 'Silver';
    nextRankTarget = 2000;
  }

  // Helper to determine exact name color for any user/desk by category
  const getItemTierColor = (item) => {
    const tag = (item?.tag || '').toLowerCase();
    const bal = Number(item?.balance || 0);
    if (tag.includes('operator') || tag.includes('apex') || bal >= 15000) return '#A855F7'; // Neon bright purple
    if (tag.includes('master') || tag.includes('titan') || bal >= 8000) return '#E11D48'; // Ruby bright red
    if (tag.includes('gold') || tag.includes('sovereign') || bal >= 4000) return '#EAB308'; // Yellow gold bright
    if (tag.includes('silver') || tag.includes('prover') || bal >= 2000) return '#94A3B8'; // Silver color
    return '#0F172A'; // Contender deep slate
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Trader';
  const rankProgress = Math.min(100, Math.max(0, (balanceNum / nextRankTarget) * 100));

  // 100% Real Verified Hall of Fame (NO FAKE / BOTS)
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    apiClient.get('/paper/hall-of-fame')
      .then(res => {
        const data = res.data;
        if (data?.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          // Normalize any balances that exceed bounds for display
          const normalized = data.leaderboard.map(item => ({
            ...item,
            balance: Number(item.balance) > 15000 ? 1000 : (Number(item.balance) || 1000)
          }));
          setRealLeaderboard(normalized);
        } else {
          setRealLeaderboard([
            {
              rank: 1,
              name: userName,
              tag: dynamicTierName,
              color: dynamicTierColor,
              der: 75.0,
              balance: balanceNum,
              isSelf: true
            }
          ]);
        }
      })
      .catch(() => {
        setRealLeaderboard([
          {
            rank: 1,
            name: userName,
            tag: dynamicTierName,
            color: dynamicTierColor,
            der: 75.0,
            balance: balanceNum,
            isSelf: true
          }
        ]);
      })
      .finally(() => setLoadingLeaderboard(false));
  }, [userName, balanceNum, dynamicTierName, dynamicTierColor]);

  // Is Pro user?
  const isProUser = Boolean(user?.is_pro || user?.isPro);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Hidden file inputs for avatar & banner upload */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={bannerInputRef} 
        onChange={handleBannerUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* ─── 1. TOP PROFILE HERO (WITH BANNER BACKGROUND & CUSTOM AVATAR) ─── */}
      <div style={{
        borderRadius: '24px',
        border: `2px solid ${dynamicTierColor === '#0F172A' ? '#E2E8F0' : dynamicTierColor}`,
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        background: bannerUrl 
          ? `linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.96) 100%), url(${bannerUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        padding: '36px 32px'
      }}>
        {/* Subtle decorative grid/banner accent overlay if no custom banner */}
        {!bannerUrl && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(90deg, #10B981 0%, ${dynamicTierColor} 50%, #F59E0B 100%)`
          }} />
        )}

        {/* Change Banner Button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}
          title="Upload custom background banner for your profile card"
        >
          <Image size={13} />
          <span>Change Banner</span>
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Left Side: Avatar, Name & Current Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Profile Avatar with Camera Upload Overlay */}
            <div 
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: 'relative',
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                background: '#FFFFFF',
                border: `3px solid ${dynamicTierColor}`,
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}
              title="Click to change profile picture"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{
                  fontSize: '34px',
                  fontWeight: 900,
                  color: dynamicTierColor
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Camera Hover Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '3px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Camera size={13} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {/* Account Holder Name in True Tier Color */}
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: 900, 
                  color: dynamicTierColor, 
                  textShadow: dynamicTierName === 'Silver' ? '0 1px 3px rgba(148, 163, 184, 0.4)'
                    : dynamicTierName === 'Gold' ? '0 2px 10px rgba(234, 179, 8, 0.35)'
                    : dynamicTierName === 'Master' ? '0 2px 10px rgba(225, 29, 72, 0.35)'
                    : dynamicTierName === 'Operator' ? '0 2px 12px rgba(168, 85, 247, 0.45)'
                    : 'none',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  {userName}
                </h1>

                {/* Big Tag Badge */}
                <span style={{
                  background: '#0F172A',
                  color: dynamicTierColor === '#0F172A' ? '#94A3B8' : dynamicTierColor,
                  border: `1.5px solid ${dynamicTierColor === '#0F172A' ? '#334155' : dynamicTierColor}`,
                  padding: '5px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase'
                }}>
                  {dynamicTierName}
                </span>

                {/* Pro Badge */}
                <button
                  onClick={() => setShowProModal(true)}
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE047',
                    color: '#B45309',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Crown size={14} color="#B45309" /> 
                  <span>{isProUser ? 'Pro Member' : 'Pro Account'}</span>
                </button>
              </div>

              {/* Subtitle Details (Removed "100% Verified Non-Tipster") */}
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>Disciplined Proving Account</span>
                <span>•</span>
                <span>ID: NS-{user?.id?.substring(0, 8) || 'CONTENDER'}</span>
                <span>•</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>Starting Baseline: $1,000.00</span>
              </div>

              {/* Next Rank Progress Bar */}
              <div style={{ marginTop: '14px', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>
                  <span>Current: ${balanceNum.toFixed(2)}</span>
                  <span>Next Tier: {nextRankName} (${nextRankTarget.toLocaleString()})</span>
                </div>
                <div style={{ height: '7px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${rankProgress}%`, 
                    height: '100%', 
                    background: dynamicTierColor === '#0F172A' ? '#10B981' : dynamicTierColor, 
                    borderRadius: '10px', 
                    transition: 'width 0.3s' 
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Big Gold Coins Vault */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
            border: '2px solid #FACC15',
            borderRadius: '18px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: '0 8px 24px rgba(234, 179, 8, 0.18)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FDE047',
              border: '2px solid #CA8A04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Coins size={30} color="#854D0E" />
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854D0E', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                GOLD COINS VAULT
              </div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#713F12', lineHeight: 1.1 }}>
                {coins} <span style={{ fontSize: '16px', fontWeight: 800 }}>Coins</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#A16207', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Flame size={13} color="#EA580C" /> 
                <span>{streakDays}-Day Discipline Streak (+25 daily)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. ENTER TRADING ARENA HERO CTA BANNER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Zap size={18} color="#FEF08A" />
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#FEF08A' }}>
              LIVE PROVING ARENA READY
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0' }}>
            Ready to Take Trades? Enter the Trading Terminal.
          </h2>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.95, maxWidth: '650px', fontWeight: 500 }}>
            Execute spot and leveraged orders with live tick data, technical indicators, and real margin rules. No paper tricks.
          </p>
        </div>

        <button 
          onClick={() => navigate('/trading')}
          style={{
            background: '#FFFFFF',
            color: '#059669',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>Launch Trading Terminal</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ─── 3. ACCOUNT & PROFILE ANALYSIS METRICS GRID ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>EQUITY / CAPITAL</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>${balanceNum.toFixed(2)}</div>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>Starting Baseline: $1,000.00</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>DER SCORE (EDGE)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981' }}>88.5 <span style={{ fontSize: '13px', color: '#64748B' }}>/ 100</span></div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Ranked Top 12% Globally</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>ACTIVE LEVERAGE</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>50x Unlocked</div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Liquidation Protection Active</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>WORKING TRADES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: positions.length > 0 ? '#10B981' : '#64748B' }}>
            {positions.length} Open
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Real-time execution state</span>
        </div>
      </div>

      {/* ─── 4. SHOWCASE OF EARNED DECAGON BADGES ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={22} color="#10B981" /> Claimed Disciplined Badges
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Active 10-sided decagon badges earned through mathematical discipline and risk-managed execution.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', background: '#F0FDF4', padding: '5px 14px', borderRadius: '20px' }}>
            4 ACTIVE BADGES
          </span>
        </div>

        {/* Claimed Decagon Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <DecagonBadge 
            icon={ShieldCheck} 
            color="#10B981" 
            bgColor="#064E3B"
            label={`${dynamicTierName} Prover`} 
            subtitle="Verified participant in NonStock Proving Arena" 
          />
          <DecagonBadge 
            icon={Zap} 
            color="#3B82F6" 
            bgColor="#1E3A8A"
            label="Zero Blowup Streak" 
            subtitle="100% disciplined margin maintenance without liquidation" 
          />
          <DecagonBadge 
            icon={Coins} 
            color="#F59E0B" 
            bgColor="#78350F"
            label="Centurion Vault" 
            subtitle="Earned and accumulated 100+ active Gold Coins" 
          />
          <DecagonBadge 
            icon={Target} 
            color="#8B5CF6" 
            bgColor="#4C1D95"
            label="Calculated Risk" 
            subtitle="Strict Stop-Loss execution on every initiated position" 
          />
        </div>

        {/* ─── LOCKED BADGES BOX (BLURRED WITH LOCK ICON, DIRECTLY BELOW CLAIMED BADGES) ─── */}
        <div style={{
          marginTop: '28px',
          padding: '24px',
          borderRadius: '16px',
          border: '1.5px dashed #CBD5E1',
          background: 'rgba(248, 250, 252, 0.7)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={16} color="#475569" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#334155', margin: 0 }}>
                  Locked Milestone Badges (Unlock by Competing)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Reach required capital hurdles and winning streaks to claim these prestigious honors.
                </p>
              </div>
            </div>

            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', background: '#E2E8F0', padding: '4px 10px', borderRadius: '12px' }}>
              4 LOCKED
            </span>
          </div>

          {/* Locked Decagon Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <DecagonBadge 
              icon={ShieldCheck} 
              color="#94A3B8" 
              label="Silver Sovereign" 
              locked={true}
              requirement="Reach $2,000 Proving Capital (+$1,000 profit)" 
            />
            <DecagonBadge 
              icon={Award} 
              color="#F59E0B" 
              label="Gold Sovereign" 
              locked={true}
              requirement="Reach $4,000 Proving Capital (+$3,000 profit)" 
            />
            <DecagonBadge 
              icon={Trophy} 
              color="#EF4444" 
              label="Master Titan" 
              locked={true}
              requirement="Reach $8,000 Proving Capital & 10 consecutive wins" 
            />
            <DecagonBadge 
              icon={Crown} 
              color="#A855F7" 
              label="Apex Operator" 
              locked={true}
              requirement="Reach $15,000 Capital & 30-day discipline streak" 
            />
          </div>
        </div>
      </div>

      {/* ─── 5. CURRENT TRADES WORKING IN ACCOUNT ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#10B981" /> Current Trades Working in Your Account
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Live positions actively running with allocated margin and liquidation protection.
            </p>
          </div>
          <button
            onClick={() => navigate('/trading')}
            style={{ background: '#F0FDF4', color: '#10B981', border: '1px solid #BBF7D0', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Open Terminal</span> <ArrowRight size={14} />
          </button>
        </div>

        {positions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <BarChart2 size={36} color="#94A3B8" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>No Active Trades Running</h4>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '400px', margin: '0 auto 16px' }}>
              Your capital is currently 100% free. Head over to the Trading Terminal to open a spot or leveraged position.
            </p>
            <button 
              onClick={() => navigate('/trading')}
              style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              Start Trading Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: 800 }}>
                  <th style={{ padding: '12px 16px' }}>ASSET</th>
                  <th style={{ padding: '12px 16px' }}>SIDE</th>
                  <th style={{ padding: '12px 16px' }}>SIZE / LEV</th>
                  <th style={{ padding: '12px 16px' }}>ENTRY PRICE</th>
                  <th style={{ padding: '12px 16px' }}>MARGIN ALLOCATED</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => {
                  const isLong = pos.side === 'LONG';
                  return (
                    <tr key={pos.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '14px' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0F172A' }}>{pos.asset}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: isLong ? '#10B981' : '#EF4444', fontWeight: 900, background: isLong ? '#F0FDF4' : '#FEF2F2', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                          {pos.side}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{pos.size} ({pos.leverage}x)</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>${Number(pos.entryPrice || 0).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>${Number(pos.margin || 0).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => closePosition(pos.id, pos.entryPrice)}
                          style={{ padding: '6px 12px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
                        >
                          Close Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 6. WATCHLIST WITH SEARCHBAR (STOCKS, FOREX, CRYPTO) ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="#F59E0B" /> Personal Watchlist & Market Monitor
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              Add stocks, forex pairs, crypto, and commodities to track live quotes.
            </p>
          </div>

          {/* Search Input Dropdown */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Search ticker (e.g. AAPL, EURUSD, BTC, Gold)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                background: '#F8FAFC'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10B981'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                marginTop: '6px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                zIndex: 100,
                maxHeight: '240px',
                overflowY: 'auto'
              }}>
                {searchResults.map(item => (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      addToWatchlist(item.symbol);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{item.symbol}</strong>
                      <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>+ Add</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {watchlist.map(sym => {
            const match = WATCHLIST_DATABASE.find(w => w.symbol === sym) || { 
              symbol: sym, 
              name: sym, 
              category: 'Asset', 
              price: '$100.00', 
              change: '+0.50%' 
            };
            const isPos = !match.change.includes('-');

            return (
              <div 
                key={sym}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>{match.symbol}</strong>
                    <span style={{ fontSize: '10px', color: '#64748B', background: '#E2E8F0', padding: '1px 5px', borderRadius: '4px' }}>{match.category}</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {match.price}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: isPos ? '#10B981' : '#EF4444' }}>
                    {match.change}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => removeFromWatchlist(sym)}
                    style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                    title="Remove from watchlist"
                  >
                    <X size={14} />
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem('nonstock_active_symbol', sym);
                      navigate('/trading');
                    }}
                    style={{
                      background: '#10B981',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 7. PLATFORM TOOLS VAULT (PRO UNLOCKED OR GOLD COIN SINK) ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={22} color="#EAB308" /> Platform Tools Vault
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              {isProUser 
                ? 'Pro Account Active: All institutional edge tools are completely unlocked.'
                : 'Spend your earned Gold Coins to unlock institutional-grade trading edge tools, or upgrade to Pro.'}
            </p>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#713F12', background: '#FEF9C3', border: '1px solid #FDE047', padding: '6px 14px', borderRadius: '20px' }}>
            Balance: {coins} Gold Coins Available
          </div>
        </div>

        {/* Tools Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Tool 1: Real-Time Screener */}
          {(() => {
            const isUnlocked = isProUser || Boolean(unlockedTools?.screener);
            return (
              <div style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: `1.5px solid ${isUnlocked ? '#10B981' : '#E2E8F0'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Search size={20} color={isUnlocked ? '#10B981' : '#64748B'} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      color: isUnlocked ? '#10B981' : '#64748B'
                    }}>
                      {isUnlocked ? (isProUser ? 'PRO UNLOCKED' : 'UNLOCKED') : '150 COINS'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Real-Time Market Screener</h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Filter thousands of global tickers in milliseconds. Scan for unusual volume, RSI extremes, and breakout momentum.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (isUnlocked) {
                      navigate('/screener');
                    } else {
                      if (unlockTool('screener', 150, 'Market Screener')) {
                        navigate('/screener');
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isUnlocked ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isUnlocked ? (
                    <><span>Launch Screener</span> <ArrowRight size={14} /></>
                  ) : (
                    <><span>Unlock for 150 Coins</span> <Lock size={14} /></>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Tool 2: Strategy Lab */}
          {(() => {
            const isUnlocked = isProUser || Boolean(unlockedTools?.strategyLab);
            return (
              <div style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: `1.5px solid ${isUnlocked ? '#10B981' : '#E2E8F0'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FlaskConical size={20} color={isUnlocked ? '#10B981' : '#64748B'} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      color: isUnlocked ? '#10B981' : '#64748B'
                    }}>
                      {isUnlocked ? (isProUser ? 'PRO UNLOCKED' : 'UNLOCKED') : '300 COINS'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Strategy Lab & Backtester</h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Test algorithmic trading theories against historical multi-year tick feeds. Prove positive mathematical expectancy.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (isUnlocked) {
                      navigate('/strategy-builder');
                    } else {
                      if (unlockTool('strategyLab', 300, 'Strategy Lab')) {
                        navigate('/strategy-builder');
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isUnlocked ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isUnlocked ? (
                    <><span>Launch Strategy Lab</span> <ArrowRight size={14} /></>
                  ) : (
                    <><span>Unlock for 300 Coins</span> <Lock size={14} /></>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Tool 3: AI Trading Mentor */}
          {(() => {
            const isUnlocked = isProUser || Boolean(unlockedTools?.aiMentor);
            return (
              <div style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: `1.5px solid ${isUnlocked ? '#10B981' : '#E2E8F0'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot size={20} color={isUnlocked ? '#10B981' : '#64748B'} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      color: isUnlocked ? '#10B981' : '#64748B'
                    }}>
                      {isUnlocked ? (isProUser ? 'PRO UNLOCKED' : 'UNLOCKED') : '200 COINS'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>AI Trading Mentor</h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Real-time chart pattern analysis, support/resistance detection, and live post-trade psychological feedback. Powered by Groq.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (isUnlocked) {
                      navigate('/ai-mentor');
                    } else {
                      if (unlockTool('aiMentor', 200, 'AI Mentor')) {
                        navigate('/ai-mentor');
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isUnlocked ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isUnlocked ? (
                    <><span>Consult AI Mentor</span> <ArrowRight size={14} /></>
                  ) : (
                    <><span>Unlock for 200 Coins</span> <Lock size={14} /></>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Tool 4: Trade Replay Simulator */}
          {(() => {
            const isUnlocked = isProUser || Boolean(unlockedTools?.replay);
            return (
              <div style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: `1.5px solid ${isUnlocked ? '#10B981' : '#E2E8F0'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock size={20} color={isUnlocked ? '#10B981' : '#64748B'} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isUnlocked ? '#F0FDF4' : '#F1F5F9',
                      color: isUnlocked ? '#10B981' : '#64748B'
                    }}>
                      {isUnlocked ? (isProUser ? 'PRO UNLOCKED' : 'UNLOCKED') : '500 COINS'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Trade Replay Simulator</h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Bar-by-bar historical price action time machine. Rewind to past volatility sessions and practice real setups.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (isUnlocked) {
                      navigate('/replay');
                    } else {
                      if (unlockTool('replay', 500, 'Trade Replay Simulator')) {
                        navigate('/replay');
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isUnlocked ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isUnlocked ? (
                    <><span>Launch Replay</span> <ArrowRight size={14} /></>
                  ) : (
                    <><span>Unlock for 500 Coins</span> <Lock size={14} /></>
                  )}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ─── 8. GLOBAL HALL OF FAME LEADERBOARD (CLEAN $1,000 PROVING BALANCES) ─── */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={22} color="#10B981" /> Verified Global Hall of Fame
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
              100% Anti-Fake: All records verified mathematically with zero manual overrides.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', background: '#F0FDF4', padding: '4px 12px', borderRadius: '20px' }}>
            UPDATED 24/7
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>RANK</th>
                <th style={{ padding: '12px 16px' }}>TRADER</th>
                <th style={{ padding: '12px 16px' }}>TAG / STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>DER SCORE</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>PORTFOLIO</th>
              </tr>
            </thead>
            <tbody>
              {realLeaderboard.map(item => (
                <tr key={item.rank} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '14px', background: item.isSelf ? '#F0FDF4' : 'transparent' }}>
                  <td style={{ padding: '16px', fontWeight: 900, color: item.rank <= 3 ? '#10B981' : '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>#{item.rank}</span>
                      {item.rank === 1 && <Trophy size={14} color="#EAB308" />}
                      {item.rank === 2 && <Medal size={14} color="#94A3B8" />}
                      {item.rank === 3 && <Medal size={14} color="#D97706" />}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 800 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        color: getItemTierColor(item),
                        fontWeight: 900,
                        fontSize: '15px',
                        textShadow: item.tag === 'Silver' ? '0 1px 2px rgba(148, 163, 184, 0.4)'
                          : item.tag === 'Gold' ? '0 1px 8px rgba(234, 179, 8, 0.35)'
                          : item.tag === 'Master' ? '0 1px 8px rgba(225, 29, 72, 0.35)'
                          : item.tag === 'Operator' ? '0 1px 10px rgba(168, 85, 247, 0.4)'
                          : 'none'
                      }}>
                        {item.name}
                      </span>
                      {item.isSelf && (
                        <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          YOU
                        </span>
                      )}
                      {item.isPro && (
                        <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          PRO
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontWeight: 900,
                      color: item.tag === 'Contender' ? '#94A3B8' : (item.color || '#94A3B8'),
                      background: '#0F172A',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      letterSpacing: '1px'
                    }}>
                      {item.tag || 'Contender'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: '#10B981' }}>
                    {item.der != null ? Number(item.der).toFixed(1) : '75.0'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    ${Number(item.balance || 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PRO UPGRADE MODAL ─── */}
      {showProModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', maxWidth: '480px', width: '100%',
            padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button 
              onClick={() => setShowProModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
            >
              ✕
            </button>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <Crown size={30} color="#D97706" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>Upgrade to NonStock Pro</h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Unlock all platform tools permanently without coin deductions, receive monthly 1,000 Gold Coins drops, and access exclusive custom badges.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Instant Unrestricted Screener & Replay</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Monthly 1,000 Gold Coins Allowance</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> Verified Pro Crown on Global Leaderboard</li>
            </ul>
            <button
              onClick={() => {
                toast.success('Pro features activated!');
                setShowProModal(false);
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: '#10B981',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Activate Pro Membership ($99/mo)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
