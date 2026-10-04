import React from 'react';

/**
 * TradingBadgeImage — Empowered High-Definition Trading Medallions
 * 
 * Features:
 * - Rich trading-specific visual imagery (Bull Candlesticks, Bear Candlesticks, Golden Bull,
 *   Order Blocks, Fibonacci Spirals, Sniper Crosshairs, Risk-Reward Scales, Apex Crown, etc.)
 * - The Badge Name is embossed directly on the medallion banner plate!
 * - 5 Distinct Tier Frames (Silver & Emerald Octagon, Platinum Diamond, 24K Gold Decagon,
 *   Imperial Ruby Titan, Grand Sovereign Apex Wings)
 * - Scalable, crisp SVG vector rendering with 3D metallic bevels and radiant auras.
 */

export default function TradingBadgeImage({
  name = 'PROVER',
  tier = 1,
  theme = 'bull_candle',
  unlocked = false,
  size = 120,
  className = '',
  style = {}
}) {
  const isUnlocked = Boolean(unlocked);

  // Clean uppercase shortened display name for badge ribbon plate
  const displayName = (name || 'PROVER')
    .toUpperCase()
    .replace(/^THE\s+/, '')
    .trim();

  // Tier color palettes
  const tierConfig = {
    1: {
      metal1: '#E2E8F0',
      metal2: '#94A3B8',
      metal3: '#475569',
      accent1: '#00DF81',
      accent2: '#05CD77',
      plateBg: '#052E16',
      plateText: '#00DF81',
      glow: 'rgba(0, 223, 129, 0.45)',
      tierLabel: 'TIER 1 • CONTENDER'
    },
    2: {
      metal1: '#F1F5F9',
      metal2: '#CBD5E1',
      metal3: '#64748B',
      accent1: '#38BDF8',
      accent2: '#0284C7',
      plateBg: '#082F49',
      plateText: '#38BDF8',
      glow: 'rgba(56, 189, 248, 0.45)',
      tierLabel: 'TIER 2 • VERIFIED'
    },
    3: {
      metal1: '#FEF08A',
      metal2: '#EAB308',
      metal3: '#854D0E',
      accent1: '#00DF81',
      accent2: '#F59E0B',
      plateBg: '#422006',
      plateText: '#FDE047',
      glow: 'rgba(234, 179, 8, 0.55)',
      tierLabel: 'TIER 3 • SOVEREIGN'
    },
    4: {
      metal1: '#FECDD3',
      metal2: '#E11D48',
      metal3: '#881337',
      accent1: '#FB7185',
      accent2: '#BE123C',
      plateBg: '#4C0519',
      plateText: '#FECDD3',
      glow: 'rgba(225, 29, 72, 0.55)',
      tierLabel: 'TIER 4 • TITAN'
    },
    5: {
      metal1: '#F3E8FF',
      metal2: '#A855F7',
      metal3: '#581C87',
      accent1: '#00DF81',
      accent2: '#C084FC',
      plateBg: '#2E1065',
      plateText: '#E9D5FF',
      glow: 'rgba(168, 85, 247, 0.65)',
      tierLabel: 'TIER 5 • APEX'
    }
  };

  const cfg = tierConfig[tier] || tierConfig[1];
  const uniqueId = `badge_${tier}_${theme}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Render specific trading artwork symbol inside the core circle
  const renderArtSymbol = () => {
    switch (theme) {
      case 'bull_candle':
      case 'candle':
        return (
          <g transform="translate(60, 52)">
            {/* Bullish Candlestick with flame aura */}
            <line x1="0" y1="-30" x2="0" y2="30" stroke={isUnlocked ? '#00DF81' : '#94A3B8'} strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-18" width="28" height="36" rx="4" fill={isUnlocked ? 'url(#greenCandleGrad)' : '#64748B'} stroke={isUnlocked ? '#05CD77' : '#475569'} strokeWidth="2" />
            {/* Candle price action tick lines */}
            <line x1="-10" y1="-8" x2="10" y2="-8" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="-10" y1="6" x2="10" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
            {/* Little upward spark */}
            {isUnlocked && (
              <polygon points="0,-36 -4,-28 0,-24 4,-28" fill="#FDE047" />
            )}
          </g>
        );

      case 'bear_candle':
        return (
          <g transform="translate(60, 52)">
            {/* Bearish rejection Candlestick */}
            <line x1="0" y1="-30" x2="0" y2="30" stroke={isUnlocked ? '#F43F5E' : '#94A3B8'} strokeWidth="3" strokeLinecap="round" />
            <rect x="-14" y="-14" width="28" height="34" rx="4" fill={isUnlocked ? 'url(#redCandleGrad)' : '#64748B'} stroke={isUnlocked ? '#E11D48' : '#475569'} strokeWidth="2" />
            <line x1="-10" y1="-4" x2="10" y2="-4" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          </g>
        );

      case 'golden_bull':
      case 'bull':
        return (
          <g transform="translate(60, 52)">
            {/* Sculpted Golden Bull Head with Emerald Horns */}
            {/* Horns */}
            <path d="M -22 -14 C -32 -28 -18 -38 -8 -26 C -12 -22 -14 -16 -16 -10 Z" fill={isUnlocked ? '#00DF81' : '#64748B'} />
            <path d="M 22 -14 C 32 -28 18 -38 8 -26 C 12 -22 14 -16 16 -10 Z" fill={isUnlocked ? '#00DF81' : '#64748B'} />
            {/* Bull Forehead & Muzzle */}
            <path d="M -18 -10 L 18 -10 L 14 14 L 0 24 L -14 14 Z" fill={isUnlocked ? 'url(#goldMetalGrad)' : '#64748B'} stroke={isUnlocked ? '#CA8A04' : '#475569'} strokeWidth="2" />
            {/* Nose Ring */}
            <circle cx="0" cy="18" r="7" fill="none" stroke={isUnlocked ? '#FEF08A' : '#94A3B8'} strokeWidth="2.5" />
            {/* Eyes */}
            <circle cx="-7" cy="-2" r="2.5" fill={isUnlocked ? '#00DF81' : '#334155'} />
            <circle cx="7" cy="-2" r="2.5" fill={isUnlocked ? '#00DF81' : '#334155'} />
          </g>
        );

      case 'order_block':
      case 'chart':
        return (
          <g transform="translate(60, 52)">
            {/* Isometric 3D Order Block Cube with Liquidity Grid */}
            <path d="M 0 -24 L 24 -12 L 0 0 L -24 -12 Z" fill={isUnlocked ? '#00DF81' : '#94A3B8'} stroke={isUnlocked ? '#FFFFFF' : '#475569'} strokeWidth="1.5" />
            <path d="M -24 -12 L 0 0 L 0 24 L -24 12 Z" fill={isUnlocked ? '#047857' : '#64748B'} stroke={isUnlocked ? '#05CD77' : '#475569'} strokeWidth="1.5" />
            <path d="M 24 -12 L 0 0 L 0 24 L 24 12 Z" fill={isUnlocked ? '#05CD77' : '#475569'} stroke={isUnlocked ? '#00DF81' : '#334155'} strokeWidth="1.5" />
            {/* Grid Line */}
            <line x1="-12" y1="-6" x2="12" y2="6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          </g>
        );

      case 'sniper_scope':
      case 'sniper':
        return (
          <g transform="translate(60, 52)">
            {/* High-Tech Sniper Crosshair Locking On Price Target */}
            <circle cx="0" cy="0" r="24" fill="none" stroke={isUnlocked ? '#00DF81' : '#94A3B8'} strokeWidth="2.5" strokeDasharray="4 2" />
            <circle cx="0" cy="0" r="14" fill="none" stroke={isUnlocked ? '#00DF81' : '#64748B'} strokeWidth="2" />
            <line x1="-28" y1="0" x2="-14" y2="0" stroke={isUnlocked ? '#00DF81' : '#475569'} strokeWidth="3" strokeLinecap="round" />
            <line x1="14" y1="0" x2="28" y2="0" stroke={isUnlocked ? '#00DF81' : '#475569'} strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="-28" x2="0" y2="-14" stroke={isUnlocked ? '#00DF81' : '#475569'} strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="14" x2="0" y2="28" stroke={isUnlocked ? '#00DF81' : '#475569'} strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill={isUnlocked ? '#EF4444' : '#64748B'} />
          </g>
        );

      case 'shield_sl':
      case 'shield':
        return (
          <g transform="translate(60, 50)">
            {/* Heraldic Capital Defense Shield */}
            <path d="M 0 -26 C 18 -26 24 -16 24 4 C 24 18 12 28 0 34 C -12 28 -24 18 -24 4 C -24 -16 -18 -26 0 -26 Z" 
                  fill={isUnlocked ? 'url(#greenCandleGrad)' : '#64748B'} 
                  stroke={isUnlocked ? '#FEF08A' : '#475569'} 
                  strokeWidth="2.5" />
            {/* Stop Loss Keypad / Lock */}
            <rect x="-8" y="-4" width="16" height="14" rx="3" fill="#FFFFFF" />
            <path d="M -5 -4 L -5 -10 C -5 -14 5 -14 5 -10 L 5 -4" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <text x="0" y="7" textAnchor="middle" fontSize="9" fontWeight="900" fill="#047857">SL</text>
          </g>
        );

      case 'fibonacci':
      case 'spiral':
        return (
          <g transform="translate(60, 52)">
            {/* Golden Ratio Fibonacci Shell */}
            <path d="M -16 16 A 8 8 0 0 1 -16 0 A 16 16 0 0 1 0 -16 A 24 24 0 0 1 24 8 A 30 30 0 0 1 -6 26" 
                  fill="none" 
                  stroke={isUnlocked ? '#FACC15' : '#94A3B8'} 
                  strokeWidth="3.5" 
                  strokeLinecap="round" />
            <circle cx="-16" cy="16" r="3" fill={isUnlocked ? '#00DF81' : '#64748B'} />
            <circle cx="0" cy="-16" r="3.5" fill={isUnlocked ? '#00DF81' : '#64748B'} />
            <circle cx="24" cy="8" r="4" fill={isUnlocked ? '#00DF81' : '#64748B'} />
          </g>
        );

      case 'diamond_hands':
      case 'diamond':
        return (
          <g transform="translate(60, 50)">
            {/* Faceted Diamond Crystal */}
            <polygon points="0,-24 18,-10 24,0 0,26 -24,0 -18,-10" 
                     fill={isUnlocked ? 'url(#diamondGrad)' : '#64748B'} 
                     stroke={isUnlocked ? '#FFFFFF' : '#475569'} 
                     strokeWidth="2" />
            <line x1="-18" y1="-10" x2="18" y2="-10" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
            <line x1="0" y1="-24" x2="-8" y2="0" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="0" y1="-24" x2="8" y2="0" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="-8" y1="0" x2="0" y2="26" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="8" y1="0" x2="0" y2="26" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          </g>
        );

      case 'risk_scale':
      case 'scale':
        return (
          <g transform="translate(60, 52)">
            {/* Risk-Reward 1:3 Mechanical Balance Scale */}
            <line x1="0" y1="-26" x2="0" y2="24" stroke={isUnlocked ? '#FACC15' : '#94A3B8'} strokeWidth="3" />
            <line x1="-22" y1="-18" x2="22" y2="-10" stroke={isUnlocked ? '#FACC15' : '#94A3B8'} strokeWidth="3" strokeLinecap="round" />
            {/* Left Pan (1 Risk) */}
            <path d="M -22 -18 L -28 -2 L -16 -2 Z" fill={isUnlocked ? '#F43F5E' : '#64748B'} />
            {/* Right Pan (3 Reward - Lower, heavier with gold) */}
            <path d="M 22 -10 L 14 10 L 30 10 Z" fill={isUnlocked ? '#00DF81' : '#64748B'} />
            <circle cx="22" cy="4" r="5" fill={isUnlocked ? '#FEF08A' : '#94A3B8'} />
            <text x="0" y="20" textAnchor="middle" fontSize="8" fontWeight="900" fill={isUnlocked ? '#FEF08A' : '#475569'}>1:3</text>
          </g>
        );

      case 'compound_curve':
      case 'rocket':
        return (
          <g transform="translate(60, 52)">
            {/* Exponential Compound Growth Rocket */}
            <path d="M -24 20 Q -6 18 4 0 Q 12 -14 22 -22" fill="none" stroke={isUnlocked ? '#00DF81' : '#94A3B8'} strokeWidth="3" strokeLinecap="round" />
            {/* Rocket Head */}
            <g transform="translate(18, -18) rotate(45)">
              <path d="M 0 -12 C 6 -6 6 6 0 12 C -6 6 -6 -6 0 -12 Z" fill={isUnlocked ? '#FACC15' : '#64748B'} stroke="#CA8A04" strokeWidth="1.5" />
              <polygon points="0,12 -4,18 4,18" fill="#EF4444" />
            </g>
          </g>
        );

      case 'lightning_exec':
      case 'lightning':
        return (
          <g transform="translate(60, 52)">
            {/* Electric Sub-10ms Lightning Bolt */}
            <polygon points="4,-28 -14,-2 0,-2 -6,28 16,2 2,2" 
                     fill={isUnlocked ? '#00DF81' : '#64748B'} 
                     stroke={isUnlocked ? '#FEF08A' : '#475569'} 
                     strokeWidth="2.5" />
          </g>
        );

      case 'apex_crown':
      case 'crown':
        return (
          <g transform="translate(60, 50)">
            {/* Imperial Apex Sovereign Crown */}
            <path d="M -24 16 L 24 16 L 22 -8 L 12 4 L 0 -18 L -12 4 L -22 -8 Z" 
                  fill={isUnlocked ? 'url(#goldMetalGrad)' : '#64748B'} 
                  stroke={isUnlocked ? '#FDE047' : '#475569'} 
                  strokeWidth="2" />
            <circle cx="-22" cy="-8" r="3" fill={isUnlocked ? '#C084FC' : '#94A3B8'} />
            <circle cx="0" cy="-18" r="4" fill={isUnlocked ? '#00DF81' : '#94A3B8'} />
            <circle cx="22" cy="-8" r="3" fill={isUnlocked ? '#C084FC' : '#94A3B8'} />
            <circle cx="0" cy="8" r="3.5" fill={isUnlocked ? '#EF4444' : '#475569'} />
          </g>
        );

      case 'master_titan':
      case 'titan':
        return (
          <g transform="translate(60, 50)">
            {/* Master Titan Ruby Medallion */}
            <polygon points="0,-24 20,-10 20,14 0,26 -20,14 -20,-10" 
                     fill={isUnlocked ? '#E11D48' : '#64748B'} 
                     stroke={isUnlocked ? '#FDE047' : '#475569'} 
                     strokeWidth="2.5" />
            <polygon points="0,-16 12,-6 12,8 0,18 -12,8 -12,-6" 
                     fill={isUnlocked ? '#881337' : '#475569'} />
            <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#FFFFFF">T</text>
          </g>
        );

      case 'gold_vault':
      case 'vault':
      default:
        return (
          <g transform="translate(60, 50)">
            {/* Sovereign 1K Gold Coin Medallion */}
            <circle cx="0" cy="0" r="22" fill={isUnlocked ? 'url(#goldMetalGrad)' : '#64748B'} stroke={isUnlocked ? '#CA8A04' : '#475569'} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="17" fill="none" stroke={isUnlocked ? '#FEF08A' : '#94A3B8'} strokeWidth="1" strokeDasharray="3 2" />
            <text x="0" y="6" textAnchor="middle" fontSize="15" fontWeight="900" fill={isUnlocked ? '#422006' : '#334155'} fontFamily="monospace">
              1K
            </text>
          </g>
        );
    }
  };

  return (
    <div 
      className={`trading-badge-emblem ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size * 1.08}px`,
        position: 'relative',
        filter: isUnlocked 
          ? `drop-shadow(0 6px 16px ${cfg.glow})` 
          : 'grayscale(0.85) opacity(0.75)',
        transition: 'transform 0.2s ease, filter 0.2s ease',
        ...style
      }}
    >
      <svg 
        viewBox="0 0 120 130" 
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          {/* Metallic Gradients */}
          <linearGradient id={`goldGrad_${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>

          <linearGradient id={`silverGrad_${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id={`electricGreenGrad_${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="30%" stopColor="#00DF81" />
            <stop offset="80%" stopColor="#05CD77" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="greenCandleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="40%" stopColor="#00DF81" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="redCandleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="40%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#9F1239" />
          </linearGradient>

          <linearGradient id="goldMetalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="40%" stopColor="#FACC15" />
            <stop offset="85%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#713F12" />
          </linearGradient>

          <linearGradient id="diamondGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* ─── 1. OUTER METALLIC FRAME / HERALDIC SHAPE ─── */}
        {/* Tier 1 & 2: Decagon Shield */}
        <path 
          d="M 60 4 L 92 14 L 112 40 L 112 76 L 92 102 L 60 114 L 28 102 L 8 76 L 8 40 L 28 14 Z" 
          fill={isUnlocked ? (tier >= 3 ? `url(#goldGrad_${uniqueId})` : `url(#silverGrad_${uniqueId})`) : '#334155'} 
          stroke={isUnlocked ? cfg.accent1 : '#475569'} 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />

        {/* Inner Sunken Recess Ring */}
        <circle 
          cx="60" 
          cy="52" 
          r="42" 
          fill={isUnlocked ? '#0F172A' : '#1E293B'} 
          stroke={isUnlocked ? cfg.accent1 : '#475569'} 
          strokeWidth="2.5" 
        />

        {/* Subtle Radial Inlay */}
        <circle 
          cx="60" 
          cy="52" 
          r="38" 
          fill={isUnlocked ? 'rgba(0, 223, 129, 0.08)' : 'transparent'} 
        />

        {/* ─── 2. CORE TRADING ARTWORK SYMBOL ─── */}
        {renderArtSymbol()}

        {/* ─── 3. EMBOSSED BADGE NAME BANNER (NAME IS ON THE IMAGE ITSELF!) ─── */}
        <g transform="translate(60, 106)">
          {/* Drop shadow for banner */}
          <rect 
            x="-54" 
            y="-11" 
            width="108" 
            height="22" 
            rx="5" 
            fill="rgba(0, 0, 0, 0.35)" 
          />
          {/* Main Metallic Nameplate */}
          <rect 
            x="-52" 
            y="-13" 
            width="104" 
            height="22" 
            rx="5" 
            fill={isUnlocked ? cfg.plateBg : '#1E293B'} 
            stroke={isUnlocked ? cfg.accent1 : '#64748B'} 
            strokeWidth="2" 
          />
          {/* Left/Right Golden Rivets */}
          <circle cx="-46" cy="-2" r="2" fill={isUnlocked ? '#FEF08A' : '#64748B'} />
          <circle cx="46" cy="-2" r="2" fill={isUnlocked ? '#FEF08A' : '#64748B'} />
          
          {/* Inscribed Badge Name (Calculated font size to fit ribbon) */}
          <text 
            x="0" 
            y="2" 
            textAnchor="middle" 
            fontSize={displayName.length > 14 ? '8' : displayName.length > 10 ? '9' : '10.5'} 
            fontWeight="900" 
            fill={isUnlocked ? cfg.plateText : '#94A3B8'} 
            letterSpacing={displayName.length > 12 ? '0.4' : '0.8'}
            style={{ textTransform: 'uppercase' }}
          >
            {displayName}
          </text>
        </g>
      </svg>
    </div>
  );
}
