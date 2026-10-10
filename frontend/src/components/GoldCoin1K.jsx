import React from 'react';

/**
 * GoldCoin1K — Institutional Minted Sovereign Coin Component
 * Displays "1K" minted on a gleaming gold coin with concentric emerald HUD rings,
 * directly representing Stocks Operator's universal $1,000 baseline capital.
 */
export default function GoldCoin1K({ size = 180, showRings = true, animated = true, style = {} }) {
  const s = size;
  const strokeWidth = Math.max(1.5, s * 0.015);

  return (
    <div 
      style={{
        position: 'relative',
        width: `${s}px`,
        height: `${s}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <svg
        width={s}
        height={s}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 8px 24px rgba(217, 119, 6, 0.25))',
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Metallic Gold Coin Gradients */}
          <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="75%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <radialGradient id="goldFaceGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="40%" stopColor="#FBBF24" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>

          <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FEF08A" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Neon Emerald HUD Ring Gradients */}
          <linearGradient id="hudEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── 1. CONCENTRIC NEON EMERALD HUD RINGS ─── */}
        {showRings && (
          <g className={animated ? "hud-spin-slow" : ""}>
            {/* Outer dotted orbital ring */}
            <circle
              cx="100"
              cy="100"
              r="94"
              stroke="#10B981"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              strokeOpacity="0.45"
            />

            {/* Segmented HUD bracket ring */}
            <circle
              cx="100"
              cy="100"
              r="86"
              stroke="#059669"
              strokeWidth="2"
              strokeDasharray="30 18 10 18"
              strokeOpacity="0.75"
              filter="url(#emeraldGlow)"
            />

            {/* Micro HUD tick marks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="100"
                y1="8"
                x2="100"
                y2="14"
                stroke="#10B981"
                strokeWidth="2"
                transform={`rotate(${deg} 100 100)`}
                strokeOpacity="0.8"
              />
            ))}
          </g>
        )}

        {/* Counter-rotating Inner HUD Ring */}
        {showRings && (
          <g className={animated ? "hud-spin-reverse" : ""}>
            <circle
              cx="100"
              cy="100"
              r="76"
              stroke="#34D399"
              strokeWidth="1"
              strokeDasharray="16 12 40 12"
              strokeOpacity="0.6"
            />
          </g>
        )}

        {/* ─── 2. THE MINTED 1K GOLD COIN BODY ─── */}
        {/* Coin Drop Shadow Base */}
        <circle cx="100" cy="103" r="66" fill="rgba(120, 53, 15, 0.4)" />

        {/* Milled Outer Rim with Gear Teeth */}
        <circle cx="100" cy="100" r="66" fill="url(#goldRimGrad)" />
        
        {/* Beveled Inner Ring */}
        <circle cx="100" cy="100" r="62" fill="#78350F" opacity="0.35" />
        <circle cx="100" cy="100" r="60" fill="url(#goldRimGrad)" />

        {/* Concentric Beaded Edge */}
        <circle
          cx="100"
          cy="100"
          r="56"
          stroke="#FEF08A"
          strokeWidth="1.5"
          strokeDasharray="2 3"
          strokeOpacity="0.9"
        />

        {/* Coin Center Face */}
        <circle cx="100" cy="100" r="53" fill="url(#goldFaceGrad)" />

        {/* Micro Guilloché Radial Lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={`gui-${deg}`}
            x1="100"
            y1="50"
            x2="100"
            y2="56"
            stroke="#FEF08A"
            strokeWidth="0.8"
            transform={`rotate(${deg} 100 100)`}
            strokeOpacity="0.5"
          />
        ))}

        {/* Arching Top Inscription */}
        <path id="curveTop" d="M 60,82 A 44,44 0 0,1 140,82" fill="none" />
        <text fontSize="6" fontWeight="900" fill="#78350F" letterSpacing="1.2">
          <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
            STOCKS OPERATOR PROTOCOL
          </textPath>
        </text>

        {/* ─── 3. THE CENTER "1K" SCULPTED EMBLEM ─── */}
        {/* "1K" Drop Shadow for 3D Minted Effect */}
        <text
          x="101"
          y="114"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-1.5"
          fill="#78350F"
          opacity="0.75"
        >
          1K
        </text>

        {/* "1K" Main Embossed Metallic Face */}
        <text
          x="100"
          y="112"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-1.5"
          fill="url(#goldTextGrad)"
          stroke="#78350F"
          strokeWidth="0.8"
        >
          1K
        </text>

        {/* Micro Sub-Inscription Under 1K */}
        <text
          x="100"
          y="125"
          textAnchor="middle"
          fontSize="5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="1.4"
          fill="#78350F"
        >
          UNIVERSAL BASELINE
        </text>

        {/* Arching Bottom Inscription */}
        <path id="curveBottom" d="M 60,126 A 44,44 0 0,0 140,126" fill="none" />
        <text fontSize="5.5" fontWeight="900" fill="#78350F" letterSpacing="1.2">
          <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
            ★ VERIFIED EDGE ★
          </textPath>
        </text>

        {/* Diagonal Specular Sheen across Coin Face */}
        <path
          d="M 58,68 Q 100,80 142,68 Q 130,52 100,52 Q 70,52 58,68 Z"
          fill="url(#goldTextGrad)"
          opacity="0.35"
        />
      </svg>

      <style>{`
        @keyframes hudSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hudSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .hud-spin-slow {
          transform-origin: 100px 100px;
          animation: hudSpinSlow 26s linear infinite;
        }
        .hud-spin-reverse {
          transform-origin: 100px 100px;
          animation: hudSpinReverse 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
