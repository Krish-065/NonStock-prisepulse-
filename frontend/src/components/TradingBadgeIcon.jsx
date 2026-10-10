import React from 'react';

/**
 * TradingBadgeIcon — Bespoke Visual Trading Imagery & High-Profile Insignia
 * Renders custom trading graphics:
 * - bull_candle: Japanese Bullish Candlestick with wicks & glowing momentum
 * - bear_hammer: Reversal Hammer Candlestick with rejection tail
 * - order_book: Bid/Ask Depth of Market Liquidity Ladder
 * - risk_shield: Armored Stop-Loss Lock & Security Shield
 * - fibonacci: Golden Ratio 0.618 Spiral Geometry
 * - sniper_scope: Tactical Limit Order Crosshairs Scope
 * - trade_streak: Dual-Core Blazing Trading Streak Flame
 * - diamond_hands: Faceted Diamond Gemstone with Specular Glints
 * - gold_vault: Bank Vault Door with Gold Bullion & Coins
 * - breakout_rocket: Ascending Spacecraft Surging Past Resistance
 * - institutional_bull: Wall Street Golden Bull Horns Crest
 * - alpha_curve: Smooth Logarithmic Compounding Equity Curve
 * - decagon_contender / silver / gold / titan / apex: High-Profile 10-Sided Decagon Badges
 */

export default function TradingBadgeIcon({
  theme = 'bull_candle',
  size = 36,
  unlocked = true,
  hasBounty = false,
  className = '',
  style = {}
}) {
  const s = size;

  // Filter or color treatment when locked
  const filterStyle = unlocked
    ? {}
    : { filter: 'grayscale(0.85) opacity(0.55)' };

  // Common wrapper styling
  const wrapperStyle = {
    width: `${s}px`,
    height: `${s}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
    ...filterStyle,
    ...style
  };

  switch (theme) {
    // ─── 1. BULLISH CANDLESTICK (DEEP ORANGE CANDLE WITH BODY & WICKS) ───
    case 'bull_candle':
    case 'candlestick':
    case 'green_candle':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bullBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="60%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="bullWickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
              <filter id="bullGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#EA580C" floodOpacity="0.45" />
              </filter>
            </defs>
            {/* Background disc */}
            <circle cx="22" cy="22" r="20" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
            
            {/* Candlestick Upper Wick */}
            <line x1="22" y1="6" x2="22" y2="14" stroke="url(#bullWickGrad)" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Candlestick Main Real Body */}
            <rect x="15" y="14" width="14" height="18" rx="3" fill="url(#bullBodyGrad)" stroke="#9A3412" strokeWidth="1.2" filter="url(#bullGlow)" />
            
            {/* Candlestick Lower Wick */}
            <line x1="22" y1="32" x2="22" y2="39" stroke="url(#bullWickGrad)" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Inner Candlestick Shimmer Lines */}
            <line x1="18" y1="18" x2="26" y2="18" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.75" strokeLinecap="round" />
            <line x1="18" y1="23" x2="24" y2="23" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
            
            {/* Mini Ascending Momentum Arrow */}
            <path d="M29 11L35 11L35 17" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 20L34 12" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    // ─── 2. BEARISH REVERSAL HAMMER / PIN BAR ───
    case 'bear_hammer':
    case 'bear_reversal':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hammerBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5" />
            {/* Upper short wick */}
            <line x1="22" y1="8" x2="22" y2="11" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            {/* Hammer Real Body */}
            <rect x="14" y="11" width="16" height="9" rx="2.5" fill="url(#hammerBodyGrad)" stroke="#B91C1C" strokeWidth="1.2" />
            {/* Long Rejection Lower Tail Wick (3x body length) */}
            <line x1="22" y1="20" x2="22" y2="38" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // ─── 3. ORDER BOOK / DEPTH OF MARKET LIQUIDITY LADDER ───
    case 'order_book':
    case 'order_block':
    case 'risk_scale':
    case 'depth_of_market':
    case 'liquidity':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Asks (Sell Orders - Red Ladder) */}
            <rect x="22" y="10" width="14" height="3" rx="1.5" fill="#EF4444" opacity="0.85" />
            <rect x="22" y="15" width="9" height="3" rx="1.5" fill="#EF4444" opacity="0.65" />
            <rect x="22" y="20" width="16" height="3" rx="1.5" fill="#EF4444" opacity="0.95" />
            {/* Bids (Buy Orders - Orange Ladder) */}
            <rect x="10" y="25" width="12" height="3" rx="1.5" fill="#EA580C" opacity="0.95" />
            <rect x="15" y="30" width="7" height="3" rx="1.5" fill="#EA580C" opacity="0.75" />
            <rect x="8" y="35" width="14" height="3" rx="1.5" fill="#EA580C" opacity="0.85" />
            {/* Mid Price Spread Divider */}
            <line x1="22" y1="7" x2="22" y2="37" stroke="#0F172A" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        </div>
      );

    // ─── 4. ARMORED RISK SHIELD / STOP LOSS LOCK ───
    case 'risk_shield':
    case 'shield_protection':
    case 'shield_sl':
    case 'stop_loss':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
            {/* Metallic Protective Shield Crest */}
            <path d="M22 8L33 13V22C33 29.5 28 35.5 22 38C16 35.5 11 29.5 11 22V13L22 8Z" fill="url(#shieldGrad)" stroke="#7C2D12" strokeWidth="1.5" />
            {/* Center Lock / Keyhole */}
            <circle cx="22" cy="21" r="3.5" fill="#FFFFFF" />
            <path d="M20.5 23L19.5 29H24.5L23.5 23" fill="#FFFFFF" />
          </svg>
        </div>
      );

    // ─── 5. FIBONACCI GOLDEN RATIO SPIRAL ───
    case 'fibonacci':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fiboGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="#FFFBEB" stroke="#FDE047" strokeWidth="1.5" />
            {/* Fibonacci Golden Spiral */}
            <path d="M22 22A2 2 0 0 1 20 20A4 4 0 0 1 24 16A8 8 0 0 1 32 24A14 14 0 0 1 18 38" stroke="url(#fiboGrad)" strokeWidth="2.8" strokeLinecap="round" />
            <text x="22" y="32" fontSize="9" fontWeight="900" fill="#B45309" textAnchor="middle" fontFamily="sans-serif">0.618</text>
          </svg>
        </div>
      );

    // ─── 6. TACTICAL SNIPER SCOPE / LIMIT ORDER EXECUTION ───
    case 'sniper_scope':
    case 'lightning_exec':
    case 'sniper':
    case 'target_scope':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Outer Scope Ring */}
            <circle cx="22" cy="22" r="14" stroke="#EA580C" strokeWidth="2" strokeDasharray="18 4" />
            {/* Crosshair Lines */}
            <line x1="22" y1="4" x2="22" y2="14" stroke="#C2410C" strokeWidth="2" />
            <line x1="22" y1="30" x2="22" y2="40" stroke="#C2410C" strokeWidth="2" />
            <line x1="4" y1="22" x2="14" y2="22" stroke="#C2410C" strokeWidth="2" />
            <line x1="30" y1="22" x2="40" y2="22" stroke="#C2410C" strokeWidth="2" />
            {/* Target Core Dot */}
            <circle cx="22" cy="22" r="3.5" fill="#EF4444" />
            <circle cx="22" cy="22" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    // ─── 7. TRADING STREAK FLAME (CONSECUTIVE TRADING DAYS DISCIPLINE) ───
    case 'trade_streak':
    case 'trading_streak':
    case 'streak_flame':
    case 'trade_streak_flame':
    case 'streak':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="streakFlameOuter" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
              <linearGradient id="streakFlameInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
            {/* Outer Flame */}
            <path d="M22 6C23 11 28 14 30 19C33 25 30 32 25 35C22 37 18 36 15 33C12 29 13 22 17 18C18 20 20 21 21 21C22 18 20 13 22 6Z" fill="url(#streakFlameOuter)" />
            {/* Inner Bright Flame Core */}
            <path d="M22 17C23 20 26 22 26 26C26 29 24 31 22 31C20 31 18 29 18 26C18 23 21 21 22 17Z" fill="url(#streakFlameInner)" />
            {/* Trading Candlestick Wick inside Flame */}
            <line x1="22" y1="21" x2="22" y2="29" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // ─── 8. DIAMOND HANDS (DISCIPLINED HOLDING & COMPELLING CAPITAL GROWTH) ───
    case 'diamond_hands':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="40%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1.5" />
            {/* Faceted Gemstone Diamond */}
            <path d="M14 17L22 9L30 17L22 35L14 17Z" fill="url(#diamondGrad)" stroke="#0369A1" strokeWidth="1.5" />
            <path d="M14 17H30M22 9V35M17 17L22 35M27 17L22 35" stroke="#E0F2FE" strokeWidth="1" strokeOpacity="0.8" />
          </svg>
        </div>
      );

    // ─── 9. INSTITUTIONAL GOLD VAULT ───
    case 'gold_vault':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill="#FEFCE8" stroke="#FDE047" strokeWidth="1.5" />
            {/* Vault Outer Wheel */}
            <circle cx="22" cy="22" r="14" fill="#334155" stroke="url(#vaultGrad)" strokeWidth="2.5" />
            {/* Vault Spokes */}
            <circle cx="22" cy="22" r="5" fill="url(#vaultGrad)" />
            <line x1="22" y1="11" x2="22" y2="33" stroke="url(#vaultGrad)" strokeWidth="2.5" />
            <line x1="11" y1="22" x2="33" y2="22" stroke="url(#vaultGrad)" strokeWidth="2.5" />
            <circle cx="22" cy="22" r="2" fill="#713F12" />
          </svg>
        </div>
      );

    // ─── 10. BREAKOUT ROCKET (EXPONENTIAL PROVING COMPOUNDER) ───
    case 'breakout_rocket':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="20" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
            {/* Rocket Hull */}
            <path d="M28 11C28 11 28 16 26 20L22 24L19 21L23 17C27 15 28 11 28 11Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
            {/* Fins */}
            <path d="M19 21L15 21L17 25L20 24" fill="#B45309" />
            <path d="M22 24L22 28L26 26L25 23" fill="#B45309" />
            {/* Thrust Flame */}
            <path d="M19 25L13 31L17 28L15 35L21 27" fill="#F59E0B" />
          </svg>
        </div>
      );

    // ─── 11. WALL STREET GOLDEN BULL ───
    case 'institutional_bull':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="20" fill="#FFFBEB" stroke="#FDE047" strokeWidth="1.5" />
            {/* Stylized Bull Horns & Head */}
            <path d="M10 13C12 18 16 19 19 20V26L22 30L25 26V20C28 19 32 18 34 13C29 14 26 18 22 17C18 18 15 14 10 13Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
            <circle cx="18" cy="23" r="1.5" fill="#FEF3C7" />
            <circle cx="26" cy="23" r="1.5" fill="#FEF3C7" />
          </svg>
        </div>
      );

    // ─── 12. SHARPE RATIO ALPHA CURVE ───
    case 'alpha_curve':
    case 'compound_curve':
    case 'equity_curve':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Smooth Logarithmic Ascending Equity Curve */}
            <path d="M11 32C16 31 19 27 23 23C27 19 30 15 35 11" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
            {/* Fill under curve */}
            <path d="M11 32C16 31 19 27 23 23C27 19 30 15 35 11V34H11V32Z" fill="rgba(234, 88, 12, 0.2)" />
            {/* Peak Star */}
            <circle cx="35" cy="11" r="3" fill="#EA580C" />
            <circle cx="35" cy="11" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    // ─── 13. HIGH-PROFILED DECAGON TIER BADGE: CONTENDER (SLATE & EMERALD) ───
    case 'decagon_contender':
    case 'contender':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="contenderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            {/* 10-Sided Decagon Shield Polygon */}
            <polygon points="22,4 32,7 39,15 39,26 32,35 22,39 12,35 5,26 5,15 12,7" fill="url(#contenderGrad)" stroke="#EA580C" strokeWidth="2" />
            <polygon points="22,8 29,10 35,16 35,25 29,32 22,35 15,32 9,25 9,16 15,10" fill="none" stroke="#EA580C" strokeWidth="1" strokeOpacity="0.5" />
            {/* Shield Check Center Emblem */}
            <path d="M22 14L28 17V22C28 26 25 29 22 30C19 29 16 26 16 22V17L22 14Z" fill="#EA580C" />
            <path d="M20 22L21.5 23.5L24.5 20.5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    // ─── 14. HIGH-PROFILED DECAGON TIER BADGE: SILVER PROVER (PLATINUM SILVER) ───
    case 'decagon_silver':
    case 'silver_prover':
    case 'silver':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="35%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>
            <polygon points="22,4 32,7 39,15 39,26 32,35 22,39 12,35 5,26 5,15 12,7" fill="url(#silverGrad)" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="22" cy="22" r="9" fill="#334155" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Silver Laurel / Star */}
            <polygon points="22,16 24,20 28,20 25,23 26,27 22,25 18,27 19,23 16,20 20,20" fill="#F8FAFC" />
          </svg>
        </div>
      );

    // ─── 15. HIGH-PROFILED DECAGON TIER BADGE: GOLD SOVEREIGN (DANGEROUS IMPERIAL BULL CREST) ───
    case 'decagon_gold':
    case 'gold_sovereign':
    case 'gold':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #EA580C',
            boxShadow: '0 0 12px rgba(234, 88, 12, 0.45)',
            position: 'relative'
          }}>
            <img 
              src="/assets/badge_gold_sovereign.jpg" 
              alt="Gold Sovereign" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      );

    // ─── 16. HIGH-PROFILED DECAGON TIER BADGE: MASTER TITAN (FIERCE DRAGON-TITAN CREST) ───
    case 'decagon_titan':
    case 'master_titan':
    case 'titan':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #C2410C',
            boxShadow: '0 0 14px rgba(194, 65, 12, 0.55)',
            position: 'relative'
          }}>
            <img 
              src="/assets/badge_master_titan.jpg" 
              alt="Master Titan" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      );

    // ─── 17. HIGH-PROFILED DECAGON TIER BADGE: APEX OPERATOR (DANGEROUS CYBER-WOLF PREDATOR CREST) ───
    case 'decagon_apex':
    case 'apex_operator':
    case 'apex_crown':
    case 'apex':
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #EA580C',
            boxShadow: '0 0 16px rgba(234, 88, 12, 0.65)',
            position: 'relative'
          }}>
            <img 
              src="/assets/badge_apex_operator.jpg" 
              alt="Apex Operator" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      );

    // Default fallback to Bull Candle
    default:
      return (
        <div className={`trading-badge-icon ${className}`} style={wrapperStyle}>
          <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="20" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
            <line x1="22" y1="7" x2="22" y2="14" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="15" y="14" width="14" height="17" rx="3" fill="#EA580C" stroke="#9A3412" strokeWidth="1.2" />
            <line x1="22" y1="31" x2="22" y2="38" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
}
