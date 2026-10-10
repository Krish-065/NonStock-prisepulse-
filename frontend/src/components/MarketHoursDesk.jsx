import React, { useState, useEffect } from 'react';
import { Sun, Moon, Clock, Globe, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { getAllMarketSessions } from '../utils/marketHours';

/**
 * MarketHoursDesk — Global Market Sessions & Live World Clock
 * Directly inspired by Screen 1 of the mobile reference design,
 * adapted to the Stocks Operator light theme (pure white, emerald green, and black text).
 */
export default function MarketHoursDesk({ 
  onSelectSession = null,
  compact = false,
  className = '',
  style = {}
}) {
  const [sessions, setSessions] = useState(() => getAllMarketSessions());
  const [activeSessionId, setActiveSessionId] = useState('new_york');

  useEffect(() => {
    const update = () => {
      setSessions(getAllMarketSessions());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const openCount = sessions.filter(s => s.isOpen).length;

  return (
    <div 
      className={`market-hours-desk ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '24px',
        padding: compact ? '20px' : '26px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#0F172A',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: '#ECFDF5',
            border: '1.5px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Market Hours
            </h3>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: openCount > 0 ? '#10B981' : '#F59E0B'
              }} />
              <span>{openCount} of 4 Sessions Currently Open</span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '5px 12px',
          borderRadius: '999px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          fontSize: '11px',
          fontWeight: 800,
          color: '#047857',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Globe size={13} color="#10B981" />
          <span>UTC SYNC</span>
        </div>
      </div>

      {/* ─── WORLD MAP PROJECTION WITH LIVE SESSION PINPOINTS ─── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: compact ? '160px' : '200px',
        borderRadius: '18px',
        background: 'radial-gradient(ellipse at center, #F0FDF4 0%, #FFFFFF 85%)',
        border: '1.5px solid #E2E8F0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Dotted Grid Pattern representing Earth Longitude/Latitude */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: '16px 16px',
          opacity: 0.85
        }} />

        {/* Simplified Vector Continents Outlines */}
        <svg 
          viewBox="0 0 1000 500" 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%',
            opacity: 0.35,
            pointerEvents: 'none'
          }}
        >
          {/* North America */}
          <path d="M120 70 L260 70 L340 180 L280 260 L200 240 L160 170 Z" fill="#BBF7D0" stroke="#10B981" strokeWidth="1" />
          {/* South America */}
          <path d="M260 260 L350 280 L320 420 L270 440 L240 320 Z" fill="#BBF7D0" stroke="#10B981" strokeWidth="1" />
          {/* Europe & Africa */}
          <path d="M460 70 L580 80 L560 180 L460 180 Z" fill="#BBF7D0" stroke="#10B981" strokeWidth="1" />
          <path d="M460 190 L580 200 L560 360 L480 340 L450 230 Z" fill="#BBF7D0" stroke="#10B981" strokeWidth="1" />
          {/* Asia */}
          <path d="M600 70 L880 90 L850 240 L720 250 L640 160 Z" fill="#BBF7D0" stroke="#10B981" strokeWidth="1" />
          {/* Australia */}
          <path d="M780 300 L900 310 L880 410 L790 400 Z" fill="#BBF7D0" stroke="#10B981" strokeWidth="1" />
        </svg>

        {/* Live Session Pinpoint Badges on the Map (Directly matching Screen 1) */}
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => setActiveSessionId(s.id)}
            style={{
              position: 'absolute',
              left: `${s.mapX}%`,
              top: `${s.mapY}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: activeSessionId === s.id ? 10 : 5,
              transition: 'transform 0.15s ease'
            }}
          >
            {/* Glowing Pulse Dot */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {s.isOpen && (
                <div style={{
                  position: 'absolute',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.3)',
                  animation: 'pulse 2s infinite'
                }} />
              )}

              {/* Pin Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: s.isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.92)',
                border: s.isOpen ? '2px solid #10B981' : '1.5px solid #CBD5E1',
                boxShadow: s.isOpen 
                  ? '0 4px 14px rgba(16, 185, 129, 0.3)' 
                  : '0 2px 6px rgba(0, 0, 0, 0.06)',
                fontSize: '11px',
                fontWeight: 900,
                color: s.isOpen ? '#047857' : '#475569',
                whiteSpace: 'nowrap'
              }}>
                <span>{s.flag}</span>
                <span>{s.name}</span>
                {s.isOpen && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981'
                  }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── SESSION CARDS LIST (WITH SUN/MOON & COUNTDOWN, MATCHING SCREEN 1) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sessions.map((session) => {
          const isSelected = activeSessionId === session.id;
          return (
            <div
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
                if (onSelectSession) onSelectSession(session);
              }}
              style={{
                background: session.isOpen ? '#F0FDF4' : '#FFFFFF',
                border: session.isOpen 
                  ? '1.5px solid #86EFAC' 
                  : (isSelected ? '1.5px solid #CBD5E1' : '1.5px solid #F1F5F9'),
                borderRadius: '16px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: session.isOpen ? '0 2px 10px rgba(16, 185, 129, 0.08)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!session.isOpen) e.currentTarget.style.borderColor = '#10B981';
              }}
              onMouseOut={(e) => {
                if (!session.isOpen && !isSelected) e.currentTarget.style.borderColor = '#F1F5F9';
              }}
            >
              {/* Left: Icon & City */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: session.isOpen ? '#ECFDF5' : '#F8FAFC',
                  border: session.isOpen ? '1px solid #10B981' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: session.isOpen ? '#059669' : '#94A3B8'
                }}>
                  {session.isOpen ? (
                    <Sun size={18} color="#059669" />
                  ) : (
                    <Moon size={18} color="#64748B" />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                      {session.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                      ({session.exchange})
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px', fontWeight: 600 }}>
                    Local: {session.localTimeStr}
                  </div>
                </div>
              </div>

              {/* Right: Real-time Countdown Text (Directly matching Screen 1!) */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: session.isOpen ? '#059669' : '#64748B',
                  letterSpacing: '-0.2px'
                }}>
                  {session.countdownText}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: session.isOpen ? '#DCFCE7' : '#F1F5F9',
                  color: session.isOpen ? '#047857' : '#64748B',
                  textTransform: 'uppercase'
                }}>
                  <span>{session.isOpen ? 'SESSION OPEN' : 'SESSION CLOSED'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
