import React, { useEffect, useRef, useState } from 'react';
import { getAllMarketSessions } from '../utils/marketHours';

/**
 * OperatorMatrixBackground (CelestialEngine)
 * - Pure Dark Dull Orange & Crisp White Theme (#C2410C, #EA580C, #9A3412, #0F172A, #FFFFFF)
 * - Artistic algorithmic trading telemetry matrix:
 *   • Dynamic 3D depth perspective order-flow lines
 *   • Subtle floating candlestick impulse waveforms & harmonics
 *   • High-tech quantitative crosshair reticles & laser telemetry nodes
 *   • Live financial market session indicators (New York, London, Tokyo, Mumbai, Sydney)
 * - Zero Earth/Sun graphics — replaced with a dedicated quantitative trading terminal environment.
 */

// Major global financial market exchange hubs for real-time live telemetry
const MARKET_HUBS = [
  { id: 'new_york', name: 'New York', code: 'NYSE', tz: 'America/New_York' },
  { id: 'london', name: 'London', code: 'LSE', tz: 'Europe/London' },
  { id: 'mumbai', name: 'Mumbai', code: 'NSE', tz: 'Asia/Kolkata' },
  { id: 'tokyo', name: 'Tokyo', code: 'TSE', tz: 'Asia/Tokyo' },
  { id: 'sydney', name: 'Sydney', code: 'ASX', tz: 'Australia/Sydney' }
];

export default function CelestialEngine({
  mode = 'hero', // 'hero' | 'ambient'
  className = '',
  style = {},
  showSessionBadges = true
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [sessions, setSessions] = useState([]);
  const [timeString, setTimeString] = useState('');

  // Update live market status
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toUTCString().slice(17, 25) + ' UTC');
      try {
        const active = getAllMarketSessions();
        setSessions(active || []);
      } catch {
        // Fallback session simulation based on hour
        const hour = now.getUTCHours();
        setSessions([
          { id: 'london', name: 'London', isOpen: hour >= 8 && hour < 16 },
          { id: 'new_york', name: 'New York', isOpen: hour >= 13 && hour < 21 },
          { id: 'tokyo', name: 'Tokyo', isOpen: hour >= 0 && hour < 6 },
          { id: 'mumbai', name: 'Mumbai', isOpen: hour >= 3 && hour < 10 },
          { id: 'sydney', name: 'Sydney', isOpen: hour >= 22 || hour < 5 }
        ]);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // HTML5 Canvas Mathematical Telemetry Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let t = 0;

    // Resize handler
    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = mode === 'hero' ? Math.max(680, rect.height) : rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Candle series data for mathematical wave
    const candlesCount = mode === 'hero' ? 48 : 28;
    const candles = Array.from({ length: candlesCount }, (_, i) => ({
      xRatio: i / (candlesCount - 1),
      baseHeight: 25 + Math.sin(i * 0.4) * 18 + Math.cos(i * 0.8) * 12,
      wickRatio: 1.5 + (i % 3) * 0.5,
      speed: 0.02 + (i % 5) * 0.005,
      offset: i * 0.25
    }));

    // Floating telemetry particles
    const particlesCount = mode === 'hero' ? 36 : 18;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0004,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.2
    }));

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      const isHero = mode === 'hero';

      // ─── 1. BACKGROUND GRADIENT ───
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isHero) {
        // Deep obsidian charcoal fading into crisp light grid
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.45, '#1E293B');
        bgGrad.addColorStop(0.85, '#0B0F19');
        bgGrad.addColorStop(1, '#020617');
      } else {
        // Subtle ambient for dashboard
        bgGrad.addColorStop(0, 'rgba(255, 247, 237, 0.45)');
        bgGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        bgGrad.addColorStop(1, 'rgba(255, 237, 213, 0.35)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ─── 2. ISOMETRIC PERSPECTIVE GRID LINES ───
      ctx.save();
      const gridSpacing = isHero ? 60 : 80;
      const gridAlpha = isHero ? 0.09 : 0.05;
      ctx.strokeStyle = isHero ? `rgba(234, 88, 12, ${gridAlpha * 1.5})` : `rgba(194, 65, 12, ${gridAlpha})`;
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x <= width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y <= height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Diagonal cross-vector lines (Institutional algorithmic depth)
      if (isHero) {
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.05)';
        ctx.setLineDash([4, 12]);
        for (let d = -height; d <= width; d += gridSpacing * 2) {
          ctx.beginPath();
          ctx.moveTo(d, 0);
          ctx.lineTo(d + height, height);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      ctx.restore();

      // ─── 3. DARK DULL ORANGE ORDER-FLOW DEPTH WAVE (HARMONIC SINE CURVE) ───
      const baselineY = isHero ? height * 0.68 : height * 0.8;
      const waveAmplitude = isHero ? 50 : 25;

      ctx.save();
      // Gradient for waveform fill
      const waveFillGrad = ctx.createLinearGradient(0, baselineY - waveAmplitude * 2, 0, height);
      if (isHero) {
        waveFillGrad.addColorStop(0, 'rgba(234, 88, 12, 0.16)');
        waveFillGrad.addColorStop(0.4, 'rgba(194, 65, 12, 0.08)');
        waveFillGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        waveFillGrad.addColorStop(0, 'rgba(234, 88, 12, 0.06)');
        waveFillGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      // Draw primary harmonic wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baselineY);

      for (let x = 0; x <= width; x += 15) {
        const nx = x / width;
        const wave = Math.sin(nx * 8 + t) * (waveAmplitude * 0.6) +
                     Math.cos(nx * 14 - t * 0.8) * (waveAmplitude * 0.3) +
                     Math.sin(nx * 4 + t * 0.5) * (waveAmplitude * 0.4);
        ctx.lineTo(x, baselineY + wave);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = waveFillGrad;
      ctx.fill();

      // Draw sharp wave crest line
      ctx.beginPath();
      for (let x = 0; x <= width; x += 15) {
        const nx = x / width;
        const wave = Math.sin(nx * 8 + t) * (waveAmplitude * 0.6) +
                     Math.cos(nx * 14 - t * 0.8) * (waveAmplitude * 0.3) +
                     Math.sin(nx * 4 + t * 0.5) * (waveAmplitude * 0.4);
        if (x === 0) ctx.moveTo(x, baselineY + wave);
        else ctx.lineTo(x, baselineY + wave);
      }
      ctx.strokeStyle = isHero ? 'rgba(234, 88, 12, 0.55)' : 'rgba(194, 65, 12, 0.25)';
      ctx.lineWidth = isHero ? 2 : 1.2;
      ctx.stroke();

      // Secondary white mathematical baseline vector
      ctx.beginPath();
      for (let x = 0; x <= width; x += 20) {
        const nx = x / width;
        const wave2 = Math.sin(nx * 10 - t * 1.2) * (waveAmplitude * 0.45);
        if (x === 0) ctx.moveTo(x, baselineY - 20 + wave2);
        else ctx.lineTo(x, baselineY - 20 + wave2);
      }
      ctx.strokeStyle = isHero ? 'rgba(255, 255, 255, 0.35)' : 'rgba(15, 23, 42, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ─── 4. ALGORITHMIC CANDLESTICK MATRIX (DARK DULL ORANGE & METALLIC WHITE) ───
      if (isHero) {
        ctx.save();
        candles.forEach((c) => {
          const cx = c.xRatio * (width - 80) + 40;
          const osc = Math.sin(t * c.speed * 40 + c.offset);
          const bodyH = Math.max(8, c.baseHeight + osc * 14);
          const cy = baselineY - 40 - Math.sin(c.xRatio * 6 + t * 0.5) * 45;
          const isUp = (c.baseHeight + osc * 14) > c.baseHeight;

          // Wick
          const wickH = bodyH * c.wickRatio;
          ctx.beginPath();
          ctx.moveTo(cx, cy - wickH / 2);
          ctx.lineTo(cx, cy + wickH / 2);
          ctx.strokeStyle = isUp ? 'rgba(234, 88, 12, 0.4)' : 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Body
          const bw = 5;
          ctx.fillStyle = isUp
            ? 'rgba(194, 65, 12, 0.75)' // Deep dark dull orange
            : 'rgba(255, 255, 255, 0.55)'; // Crisp white accent
          ctx.strokeStyle = isUp ? '#EA580C' : '#FFFFFF';
          ctx.lineWidth = 0.8;
          ctx.fillRect(cx - bw / 2, cy - bodyH / 2, bw, bodyH);
          ctx.strokeRect(cx - bw / 2, cy - bodyH / 2, bw, bodyH);
        });
        ctx.restore();
      }

      // ─── 5. FLOATING TELEMETRY NODES & CROSSHAIRS ───
      ctx.save();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        const px = p.x * width;
        const py = p.y * height;

        ctx.fillStyle = isHero ? `rgba(234, 88, 12, ${p.alpha * 0.8})` : `rgba(194, 65, 12, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle crosshair around every 4th particle
        if (Math.round(p.size * 10) % 4 === 0 && isHero) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 0.8;
          const s = 6;
          ctx.beginPath();
          ctx.moveTo(px - s, py);
          ctx.lineTo(px + s, py);
          ctx.moveTo(px, py - s);
          ctx.lineTo(px, py + s);
          ctx.stroke();
        }
      });
      ctx.restore();

      // ─── 6. CORNER TACTICAL TELEMETRY HUD (HERO MODE ONLY) ───
      if (isHero) {
        ctx.save();
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(234, 88, 12, 0.5)';
        ctx.fillText('STOCKS OPERATOR // QUANT ARCHITECTURE V3.8', 24, 30);
        ctx.fillText(`TELEMETRY: ${timeString} [LATENCY: 0.84ms]`, 24, 46);

        // Top right telemetry coordinates
        const sysInfo = 'ORDERBOOK PROTOCOL: ACTIVE';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(sysInfo, width - 24, 30);
        ctx.fillText('UNIVERSAL PROVING ENGINE: ONLINE', width - 24, 46);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, timeString]);

  const isHero = mode === 'hero';

  return (
    <div
      ref={containerRef}
      className={`operator-matrix-bg ${className}`}
      style={{
        position: isHero ? 'relative' : 'fixed',
        inset: isHero ? 'auto' : 0,
        width: '100%',
        height: isHero ? 'auto' : '100%',
        minHeight: isHero ? '680px' : 'auto',
        overflow: 'hidden',
        pointerEvents: isHero ? 'auto' : 'none',
        zIndex: 0,
        ...style
      }}
    >
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />

      {/* Hero Overlay: Live Market Session Badges Bar (Dark Dull Orange & White) */}
      {isHero && showSessionBadges && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          padding: '0 16px',
          flexWrap: 'wrap',
          zIndex: 2
        }}>
          {MARKET_HUBS.map((hub) => {
            const activeSession = sessions.find(s => s.id === hub.id);
            const isOpen = activeSession ? activeSession.isOpen : false;

            return (
              <div
                key={hub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: isOpen ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.65)',
                  border: isOpen ? '1.5px solid #EA580C' : '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isOpen ? '0 2px 10px rgba(234, 88, 12, 0.3)' : 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isOpen ? '#FFFFFF' : '#94A3B8',
                  letterSpacing: '0.4px',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isOpen ? '#EA580C' : '#64748B',
                  boxShadow: isOpen ? '0 0 8px #EA580C' : 'none'
                }} />
                <span>{hub.name} ({hub.code})</span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  color: isOpen ? '#EA580C' : '#64748B',
                  marginLeft: '2px',
                  textTransform: 'uppercase'
                }}>
                  {isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
