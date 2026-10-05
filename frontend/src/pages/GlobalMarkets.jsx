import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { 
  Globe, TrendingUp, TrendingDown, DollarSign, Activity, 
  Clock, ShieldAlert, BarChart3, RefreshCw, Zap, ArrowUpRight, 
  ArrowDownRight, Compass, Layers, AlertCircle, Info, CheckCircle2,
  Calendar, Flame, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import MarketHoursDesk from '../components/MarketHoursDesk';

export default function GlobalMarkets() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%', color: '#0F172A', background: '#F8FAFC' }}>
      {/* ─── 1. TOP HEADER & GLOBAL MACRO SENTIMENT BANNER ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: isMobile ? '18px 16px' : '28px 32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div style={{
                background: '#ECFDF5',
                color: '#059669',
                borderRadius: '10px',
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #A7F3D0'
              }}>
                <Globe size={18} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                FOREIGN MARKET INTELLIGENCE & GLOBAL MACRO
              </span>
              <span style={{
                background: '#F1F5F9',
                color: '#64748B',
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '6px',
                fontWeight: 700
              }}>
                REAL-TIME SYNC
              </span>
            </div>

            <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              Global Markets Radar & Technical Macro Barometer
            </h1>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0 0', maxWidth: '720px', lineHeight: 1.5 }}>
              Institutional cross-asset analysis tracking US equities, European bourses, Asian powerhouses, US 10Y Yields, Dollar Index, and Foreign Capital Flow proxies.
            </p>
          </div>

          {/* Action buttons & refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
            <button
              onClick={() => fetchGlobalData(true)}
              disabled={refreshing}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} color="#059669" />
              <span>{refreshing ? 'Updating Feeds...' : 'Refresh Quotes'}</span>
            </button>
          </div>
        </div>

        {/* Sentiment & Global Risk Meter Bar */}
        {data?.sentiment && (
          <div style={{
            marginTop: '20px',
            padding: isMobile ? '16px' : '18px 24px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: isMobile ? '16px' : '20px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                GLOBAL RISK APPETITE COMPOSITE
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '30px', fontWeight: 900, color: '#059669' }}>
                  {data.sentiment.score}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  {data.sentiment.label}
                </span>
              </div>
              <div style={{
                height: '7px',
                background: '#E2E8F0',
                borderRadius: '999px',
                marginTop: '10px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${data.sentiment.score}%`,
                  background: 'linear-gradient(90deg, #10B981, #059669)',
                  borderRadius: '999px'
                }} />
              </div>
            </div>

            {/* FII Foreign Capital Bias */}
            <div style={{ 
              borderLeft: isMobile ? 'none' : '1px solid #E2E8F0', 
              borderTop: isMobile ? '1px solid #E2E8F0' : 'none',
              paddingLeft: isMobile ? '0' : '20px',
              paddingTop: isMobile ? '14px' : '0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                FII CAPITAL FLOW PROXY
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#059669" />
                {data.fiiAnalysis?.bias}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                {data.fiiAnalysis?.keyDriver}
              </div>
            </div>

            {/* FII Flow Estimate */}
            <div style={{ 
              borderLeft: isMobile ? 'none' : '1px solid #E2E8F0', 
              borderTop: isMobile ? '1px solid #E2E8F0' : 'none',
              paddingLeft: isMobile ? '0' : '20px',
              paddingTop: isMobile ? '14px' : '0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                PROJECTED EM ALLOCATION
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
                {data.fiiAnalysis?.fiiScore}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px', border: '1px solid #A7F3D0' }}>
                {data.fiiAnalysis?.signalStrength}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── LIVE GLOBAL MARKET SESSIONS & WORLD HOURS (MATCHING SCREEN 1) ─── */}
      <MarketHoursDesk />

      {/* ─── 2. MACRO BAROMETER CARDS (YIELDS, DOLLAR, VIX, CRUDE, GOLD) ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Activity size={18} color="#059669" />
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Foreign Macro Barometer & Crucial Yields
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          {data?.macro?.map(item => {
            const isPositive = (item.changePercent || 0) >= 0;
            return (
              <div 
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '18px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>{item.name}</div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.impact === 'Bullish' ? '#ECFDF5' : (item.impact === 'Risk-On' ? '#EFF6FF' : '#F1F5F9'),
                    color: item.impact === 'Bullish' ? '#059669' : (item.impact === 'Risk-On' ? '#0284C7' : '#475569')
                  }}>
                    {item.impact}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>
                    {item.unit === '₹' ? `₹${item.price?.toFixed(2)}` : (item.unit === '$' ? `$${item.price?.toFixed(4)}` : item.price?.toFixed(2))}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{item.unit}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: isPositive ? '#059669' : '#DC2626',
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
                  borderTop: '1px solid #F1F5F9',
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
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#059669" /> Major Foreign Stock Exchanges & Indices
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
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
                  background: selectedRegion === region ? '#10B981' : '#F8FAFC',
                  color: selectedRegion === region ? '#FFFFFF' : '#64748B',
                  border: selectedRegion === region ? '1px solid #10B981' : '1px solid #E2E8F0',
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
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredIndices.map(idx => {
            const isUp = (idx.changePercent || 0) >= 0;
            return (
              <div 
                key={idx.id}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {idx.country} • {idx.region}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0' }}>
                      {idx.name}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#64748B',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {idx.ticker}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>
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
                    background: isUp ? '#ECFDF5' : '#FEF2F2',
                    color: isUp ? '#059669' : '#DC2626',
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
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '18px',
        padding: isMobile ? '18px 16px' : '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#059669" /> World Financial Centers Live Status
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Live status of world stock exchanges, session overlap times, and active liquidity cycles.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {data?.sessions?.map((sess, idx) => (
            <div 
              key={idx}
              style={{
                background: sess.isOpen ? '#ECFDF5' : '#F8FAFC',
                border: sess.isOpen ? '1.5px solid #10B981' : '1px solid #E2E8F0',
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
                  background: sess.isOpen ? '#10B981' : '#F1F5F9',
                  color: sess.isOpen ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: sess.isOpen ? '#FFFFFF' : '#64748B',
                    display: 'inline-block'
                  }} />
                  {sess.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{sess.city}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{sess.market}</div>
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Session: {sess.hours}
              </div>

              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: sess.trend.includes('Bullish') || sess.trend.includes('Rally') ? '#059669' : '#0284C7',
                marginTop: '4px'
              }}>
                Signal: {sess.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. CROSS-MARKET CORRELATIONS & MACRO CATALYST RADAR ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Quantitative Correlations */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: isMobile ? '18px 16px' : '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#059669" /> Cross-Market Macro Correlations
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
            Statistical relationship between global assets and domestic market direction.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.correlations?.map((c, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '8px' : '12px'
                }}
              >
                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', wordBreak: 'break-word' }}>{c.pair}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>{c.impact}</div>
                </div>

                <div style={{ 
                  textAlign: isMobile ? 'left' : 'right',
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: isMobile ? 'center' : 'flex-end',
                  justifyContent: isMobile ? 'space-between' : 'flex-start',
                  width: isMobile ? '100%' : 'auto',
                  borderTop: isMobile ? '1px dashed #E2E8F0' : 'none',
                  paddingTop: isMobile ? '8px' : '0'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: c.coefficient.startsWith('+') ? '#059669' : '#DC2626' }}>
                    {c.coefficient}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>{c.correlation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Economic Catalysts */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: isMobile ? '18px 16px' : '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#0284C7" /> High-Impact Foreign Economic Catalysts
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
            Upcoming central bank meetings, inflation reports, and liquidity events.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.macroCalendar?.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '8px' : '12px'
                }}
              >
                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', wordBreak: 'break-word' }}>{item.event}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                    Consensus: <span style={{ color: '#059669', fontWeight: 700 }}>{item.consensus}</span>
                  </div>
                </div>

                <div style={{ 
                  textAlign: isMobile ? 'left' : 'right',
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: isMobile ? 'center' : 'flex-end',
                  justifyContent: isMobile ? 'space-between' : 'flex-start',
                  width: isMobile ? '100%' : 'auto',
                  borderTop: isMobile ? '1px dashed #E2E8F0' : 'none',
                  paddingTop: isMobile ? '8px' : '0'
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: item.impact === 'High' ? '#FEF2F2' : '#FEF3C7',
                    color: item.impact === 'High' ? '#DC2626' : '#B45309',
                    border: item.impact === 'High' ? '1px solid #FCA5A5' : '1px solid #FDE047',
                    textTransform: 'uppercase'
                  }}>
                    {item.impact} Impact
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: isMobile ? '0' : '4px', fontWeight: 700 }}>{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
