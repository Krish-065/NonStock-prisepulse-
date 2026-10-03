import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { 
  Globe, TrendingUp, TrendingDown, DollarSign, Activity, 
  Clock, ShieldAlert, BarChart3, RefreshCw, Zap, ArrowUpRight, 
  ArrowDownRight, Compass, Layers, AlertCircle, Info, CheckCircle2,
  Calendar, Flame, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalMarkets() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeTab, setActiveTab] = useState('overview'); // overview, macro, sessions, correlations

  const fetchGlobalData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiClient.get('/market/foreign-analysis');
      setData(res.data);
      if (isManual) toast.success('Global market feeds refreshed');
    } catch (err) {
      console.error('Failed to load foreign market data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(() => fetchGlobalData(false), 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredIndices = React.useMemo(() => {
    if (!data?.indices) return [];
    if (selectedRegion === 'All') return data.indices;
    return data.indices.filter(i => i.region === selectedRegion);
  }, [data, selectedRegion]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* ─── 1. TOP HEADER & GLOBAL MACRO SENTIMENT BANNER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 14, 27, 0.98))',
        borderRadius: '20px',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)'
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: 'rgba(0, 255, 136, 0.15)',
                color: '#00FF88',
                borderRadius: '10px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 255, 136, 0.3)'
              }}>
                <Globe size={22} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#00FF88', letterSpacing: '1px', textTransform: 'uppercase' }}>
                FOREIGN MARKET INTELLIGENCE & GLOBAL MACRO
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#94A3B8',
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700
              }}>
                REAL-TIME SYNC
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
              Global Markets Radar & Technical Macro Barometer
            </h1>
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: '6px 0 0 0', maxWidth: '720px', lineHeight: 1.5 }}>
              Institutional-grade cross-asset analysis tracking US equities, European bourses, Asian powerhouses, US 10Y Yields, Dollar Index, and Foreign Capital Flow proxies.
            </p>
          </div>

          {/* Action buttons & refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => fetchGlobalData(true)}
              disabled={refreshing}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{refreshing ? 'Updating Feeds...' : 'Refresh Quotes'}</span>
            </button>
          </div>
        </div>

        {/* Sentiment & Global Risk Meter Bar */}
        {data?.sentiment && (
          <div style={{
            marginTop: '24px',
            padding: '18px 24px',
            background: 'rgba(10, 14, 27, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                GLOBAL RISK APPETITE COMPOSITE
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#00FF88', fontFamily: 'var(--font-mono)' }}>
                  {data.sentiment.score}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  {data.sentiment.label}
                </span>
              </div>
              <div style={{
                height: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                marginTop: '10px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${data.sentiment.score}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #10B981, #00FF88)',
                  borderRadius: '999px',
                  boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                }} />
              </div>
            </div>

            {/* FII Foreign Capital Bias */}
            <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                FII CAPITAL FLOW PROXY
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#38BDF8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#38BDF8" />
                {data.fiiAnalysis?.bias}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.4 }}>
                {data.fiiAnalysis?.keyDriver}
              </div>
            </div>

            {/* FII Flow Estimate */}
            <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                PROJECTED EM ALLOCATION
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {data.fiiAnalysis?.fiiScore}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>
                {data.fiiAnalysis?.signalStrength}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. MACRO BAROMETER CARDS (YIELDS, DOLLAR, VIX, CRUDE, GOLD) ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Activity size={18} color="#00FF88" />
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Foreign Macro Barometer & Crucial Yields
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          {data?.macro?.map(item => {
            const isPositive = (item.changePercent || 0) >= 0;
            return (
              <div 
                key={item.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '14px',
                  padding: '18px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>{item.name}</div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.impact === 'Bullish' ? 'rgba(0, 255, 136, 0.12)' : (item.impact === 'Risk-On' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.08)'),
                    color: item.impact === 'Bullish' ? '#00FF88' : (item.impact === 'Risk-On' ? '#38BDF8' : '#CBD5E1')
                  }}>
                    {item.impact}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                    {item.unit === '₹' ? `₹${item.price?.toFixed(2)}` : (item.unit === '$' ? `$${item.price?.toFixed(4)}` : item.price?.toFixed(2))}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{item.unit}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: isPositive ? '#00FF88' : '#F43F5E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isPositive ? `+${item.changePercent?.toFixed(2)}%` : `${item.changePercent?.toFixed(2)}%`}
                  </span>
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#64748B',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  lineHeight: 1.3
                }}>
                  {item.signal}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. GLOBAL EQUITY INDICES GRID WITH REGION TABS ─── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#00FF88" /> Major Foreign Stock Exchanges & Indices
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0' }}>
              Real-time foreign index benchmarks from Wall Street, Europe, and Asia-Pacific.
            </p>
          </div>

          {/* Region Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Americas', 'Europe', 'Asia-Pacific'].map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                style={{
                  background: selectedRegion === region ? '#00FF88' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedRegion === region ? '#0A0E17' : '#94A3B8',
                  border: selectedRegion === region ? '1px solid #00FF88' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Indices Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredIndices.map(idx => {
            const isUp = (idx.changePercent || 0) >= 0;
            return (
              <div 
                key={idx.id}
                style={{
                  background: 'rgba(10, 14, 27, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.35)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.background = 'rgba(10, 14, 27, 0.65)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {idx.country} • {idx.region}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0' }}>
                      {idx.name}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#94A3B8',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {idx.ticker}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                      {idx.price ? Number(idx.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      H: {idx.dayHigh ? Number(idx.dayHigh).toFixed(2) : '--'} | L: {idx.dayLow ? Number(idx.dayLow).toFixed(2) : '--'}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: isUp ? 'rgba(0, 255, 136, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    color: isUp ? '#00FF88' : '#F43F5E',
                    fontSize: '13px',
                    fontWeight: 900
                  }}>
                    {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{isUp ? `+${idx.changePercent?.toFixed(2)}%` : `${idx.changePercent?.toFixed(2)}%`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 4. WORLD FINANCIAL SESSIONS & TRADING CLOCKS ─── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#38BDF8" /> World Financial Centers Live Status
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0' }}>
            Live status of world stock exchanges, session overlap times, and active liquidity cycles.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {data?.sessions?.map((sess, idx) => (
            <div 
              key={idx}
              style={{
                background: sess.isOpen ? 'rgba(0, 255, 136, 0.05)' : 'rgba(10, 14, 27, 0.65)',
                border: sess.isOpen ? '1.5px solid rgba(0, 255, 136, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{sess.flag}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: sess.isOpen ? '#00FF88' : 'rgba(255, 255, 255, 0.08)',
                  color: sess.isOpen ? '#0A0E17' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: sess.isOpen ? '#0A0E17' : '#64748B',
                    display: 'inline-block'
                  }} />
                  {sess.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>{sess.city}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{sess.market}</div>
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                Session: {sess.hours}
              </div>

              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: sess.trend.includes('Bullish') || sess.trend.includes('Rally') ? '#00FF88' : '#38BDF8',
                marginTop: '4px'
              }}>
                Signal: {sess.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. CROSS-MARKET CORRELATIONS & MACRO CATALYST RADAR ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Quantitative Correlations */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#00FF88" /> Cross-Market Macro Correlations
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0' }}>
            Statistical relationship between global assets and domestic market direction.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.correlations?.map((c, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(10, 14, 27, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E8F0' }}>{c.pair}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{c.impact}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: c.coefficient.startsWith('+') ? '#00FF88' : '#F43F5E', fontFamily: 'var(--font-mono)' }}>
                    {c.coefficient}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>{c.correlation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Economic Catalysts */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#38BDF8" /> High-Impact Foreign Economic Catalysts
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0' }}>
            Upcoming central bank meetings, inflation reports, and liquidity events.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.macroCalendar?.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(10, 14, 27, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.event}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    Consensus: <span style={{ color: '#00FF88' }}>{item.consensus}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: item.impact === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                    color: item.impact === 'High' ? '#F43F5E' : '#FBBF24',
                    textTransform: 'uppercase'
                  }}>
                    {item.impact} Impact
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
