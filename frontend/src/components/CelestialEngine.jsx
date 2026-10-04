import React, { useEffect, useRef, useState } from 'react';
import { getAllMarketSessions } from '../utils/marketHours';

/**
 * CelestialEngine — Real-Time Astronomical Geocentric Earth & Revolving Sun
 * - Earth rotates on its tilted polar axis (~23.4°)
 * - The Sun revolves around the Earth from East to West over the 24-hour UTC cycle
 * - The Sun illuminates the morning / daytime hemisphere, lighting up active market sessions
 * - Renders dynamic vertical trading volume pillars (mirroring the reference design)
 * - Highlights live market sessions (New York, London, Tokyo, Sydney) with sun/moon indicators
 * - 100% Light Theme compatible (crisp white, emerald green, and black text)
 */

// Spherical coordinates for Earth's continental landmasses [latitude, longitude]
const CONTINENTS = [
  // North America
  [
    [70, -160], [70, -130], [60, -80], [50, -55], [30, -80], [25, -80], [20, -100], 
    [15, -90], [20, -105], [30, -115], [35, -120], [50, -125], [60, -140], [65, -165]
  ],
  // South America
  [
    [10, -75], [5, -50], [-10, -35], [-25, -45], [-45, -65], [-55, -70], [-40, -75], 
    [-20, -70], [-5, -80], [5, -78]
  ],
  // Eurasia (Europe + Asia)
  [
    [70, 30], [70, 60], [75, 100], [70, 140], [60, 170], [50, 140], [35, 120], 
    [22, 115], [10, 105], [20, 85], [25, 65], [15, 50], [30, 35], [38, 25], 
    [45, 15], [55, 10], [60, 25]
  ],
  // Africa
  [
    [35, -5], [35, 25], [30, 32], [15, 45], [10, 50], [-5, 40], [-34, 25], 
    [-34, 18], [-10, 12], [5, 2], [15, -17], [25, -15]
  ],
  // Australia
  [
    [-15, 130], [-12, 136], [-15, 145], [-25, 150], [-35, 150], [-38, 145], 
    [-35, 115], [-22, 114], [-18, 122]
  ]
];

// Major global financial exchange coordinates [lat, lon, id, name, flag]
const FINANCIAL_MARKET_HUBS = [
  { id: 'new_york', lat: 40.71, lon: -74.00, name: 'New York', flag: '🇺🇸', exchange: 'NYSE' },
  { id: 'london', lat: 51.50, lon: -0.12, name: 'London', flag: '🇬🇧', exchange: 'LSE' },
  { id: 'tokyo', lat: 35.68, lon: 139.69, name: 'Tokyo', flag: '🇯🇵', exchange: 'TSE' },
  { id: 'sydney', lat: -33.86, lon: 151.20, name: 'Sydney', flag: '🇦🇺', exchange: 'ASX' }
];

export default function CelestialEngine({ 
  mode = 'hero', // 'hero' | 'ambient'
  className = '',
  style = {},
  showSessionBadges = true
}) {
  const canvasRef = useRef(null);
  const [timeString, setTimeString] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial astronomical angle derived from actual UTC milliseconds
    const getUtcDayFraction = () => {
      const now = new Date();
      const msToday = (now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) * 1000 + now.getUTCMilliseconds();
      return msToday / 86400000;
    };

    let earthRotAngle = getUtcDayFraction() * 2 * Math.PI;
    // The Sun revolves from East to West across the globe
    let sunEastWestOrbit = -getUtcDayFraction() * 2 * Math.PI;
    let lastTime = performance.now();

    // 22 vertical financial trading volume bar graph pillars (matching the reference image!)
    const numBars = mode === 'hero' ? 22 : 12;
    const barHeights = Array.from({ length: numBars }, (_, i) => ({
      baseHeight: 0.22 + 0.62 * Math.sin((i / numBars) * Math.PI),
      phase: Math.random() * Math.PI * 2,
      speed: 0.0016 + Math.random() * 0.0018
    }));

    const render = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Realistic speed scaling
      const speed = mode === 'hero' ? 0.0003 : 0.00012;
      earthRotAngle += speed * (delta || 16);
      sunEastWestOrbit -= (speed * 1.1) * (delta || 16); // Sun moves East-to-West

      ctx.clearRect(0, 0, width, height);

      const isHero = mode === 'hero';
      const radius = isHero 
        ? Math.min(width * 0.44, height * 0.74, 420)
        : Math.min(width * 0.46, height * 0.65, 420);

      const centerX = width * 0.5; // Always centered behind the content
      const centerY = isHero ? height * 0.95 : height * 0.54; // Gracefully centered in ambient background

      // ─── 1. ORBITAL REVOLVING SUN (EAST TO WEST ACROSS CELESTIAL HORIZON) ───
      // The Sun orbits the Earth in a sweeping circular arc from East to West
      const sunDistanceX = radius * 1.35;
      const sunDistanceY = radius * 0.75;
      const sunX = centerX + Math.cos(sunEastWestOrbit) * sunDistanceX;
      const sunY = centerY + Math.sin(sunEastWestOrbit) * sunDistanceY * 0.45 - radius * 0.42;

      // Is the Sun currently behind the Earth?
      const isSunBehind = Math.sin(sunEastWestOrbit) < 0 || sunY < centerY - radius * 0.15;

      // Draw Sun Coronas and Radiant Flares
      ctx.save();
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 0.95);
      if (isHero) {
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        sunGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.9)'); // Bright solar gold
        sunGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.45)'); // Warm amber
        sunGrad.addColorStop(0.65, 'rgba(16, 185, 129, 0.18)'); // Emerald space refraction
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
        sunGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.22)');
        sunGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, radius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Solar Flare Rays radiating from the Sun
      if (isHero) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.lineWidth = 1.2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          const rayLen = radius * (0.35 + 0.15 * Math.sin(currentTime * 0.003 + a * 3));
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(a) * 20, sunY + Math.sin(a) * 20);
          ctx.lineTo(sunX + Math.cos(a) * rayLen, sunY + Math.sin(a) * rayLen);
          ctx.stroke();
        }
      }

      // Sun Core Disc
      ctx.beginPath();
      ctx.arc(sunX, sunY, isHero ? 34 : 18, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF5';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = isHero ? 32 : 16;
      ctx.fill();
      ctx.restore();

      // ─── 2. EARTH ATMOSPHERE & EMERALD RIM GLOW ───
      ctx.save();
      const atmoGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.82,
        centerX, centerY, radius * 1.18
      );
      atmoGrad.addColorStop(0, 'rgba(16, 185, 129, 0.28)'); // Emerald atmospheric mantle
      atmoGrad.addColorStop(0.45, 'rgba(5, 150, 105, 0.14)');
      atmoGrad.addColorStop(0.8, 'rgba(52, 211, 153, 0.04)');
      atmoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ─── 3. SPHERICAL PROJECTION WITH AXIAL TILT (~23.4°) ───
      const axisTilt = (23.4 * Math.PI) / 180;
      const cosTilt = Math.cos(axisTilt);
      const sinTilt = Math.sin(axisTilt);

      // Converts (lat, lon) to 3D Cartesian coords rotated by earthRotAngle and tilted on polar axis
      const project = (latDeg, lonDeg, rotAngle) => {
        const phi = (latDeg * Math.PI) / 180;
        const lambda = (lonDeg * Math.PI) / 180;
        const theta = rotAngle;

        // Raw 3D on unit sphere
        const x0 = Math.cos(phi) * Math.sin(lambda - theta);
        const y0 = -Math.sin(phi);
        const z0 = Math.cos(phi) * Math.cos(lambda - theta);

        // Apply Earth axial tilt
        const x3d = x0;
        const y3d = y0 * cosTilt - z0 * sinTilt;
        const z3d = y0 * sinTilt + z0 * cosTilt;

        return {
          x: centerX + x3d * radius,
          y: centerY + y3d * radius,
          visible: z3d > 0.04,
          depth: z3d,
          x3d, y3d, z3d
        };
      };

      // Calculate directional vector of the revolving Sun relative to Earth
      const sunVector = {
        x: (sunX - centerX) / sunDistanceX,
        y: (sunY - centerY) / sunDistanceY,
        z: isSunBehind ? -0.7 : 0.7
      };

      // Clip strictly inside the 3D Earth sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Earth Globe Ocean: Diurnal Sunlight & Twilight Gradient
      const oceanGrad = ctx.createRadialGradient(
        centerX + sunVector.x * radius * 0.45,
        centerY + sunVector.y * radius * 0.45,
        radius * 0.1,
        centerX, centerY, radius
      );

      if (isHero) {
        oceanGrad.addColorStop(0, '#FFFFFF');        // Noon / Full daylight
        oceanGrad.addColorStop(0.35, '#F0FDF4');     // Morning sunlight mist
        oceanGrad.addColorStop(0.7, '#DCFCE7');      // Emerald dawn
        oceanGrad.addColorStop(1, '#A7F3D0');        // Deep emerald limb
      } else {
        oceanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        oceanGrad.addColorStop(0.45, 'rgba(240, 253, 244, 0.75)');
        oceanGrad.addColorStop(1, 'rgba(167, 243, 208, 0.55)');
      }

      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // ─── 4. LATITUDE & LONGITUDE GEODESIC GRID ───
      ctx.lineWidth = isHero ? 0.9 : 0.6;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';

      // Parallels
      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          const pt = project(lat, lon, earthRotAngle);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      });

      // Meridians
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = project(lat, lon, earthRotAngle);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // ─── 5. CONTINENT LANDMASS POLYGONS ───
      CONTINENTS.forEach((polygon) => {
        ctx.beginPath();
        let anyVisible = false;
        let firstPt = null;

        polygon.forEach(([lat, lon]) => {
          const pt = project(lat, lon, earthRotAngle);
          if (pt.visible) {
            anyVisible = true;
            if (!firstPt) {
              ctx.moveTo(pt.x, pt.y);
              firstPt = pt;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        });

        if (anyVisible && firstPt) {
          ctx.closePath();
          ctx.fillStyle = isHero ? 'rgba(16, 185, 129, 0.36)' : 'rgba(16, 185, 129, 0.22)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(5, 150, 105, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // ─── 6. LIVE FINANCIAL SESSIONS: BEACONS & DAYLIGHT STATUS ───
      const sessions = getAllMarketSessions();

      FINANCIAL_MARKET_HUBS.forEach((hub) => {
        const pt = project(hub.lat, hub.lon, earthRotAngle);
        if (pt.visible) {
          const sessionState = sessions.find(s => s.id === hub.id);
          const isOpen = sessionState?.isOpen || false;
          const isDaylight = sessionState?.isDaylight || false;

          // Beacon pulse
          const pulse = (Math.sin(currentTime * 0.005 + hub.lon) + 1) * 0.5;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isOpen ? 4 + pulse * 2.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isOpen ? '#10B981' : (isDaylight ? '#F59E0B' : '#64748B');
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isOpen ? 8 + pulse * 5 : 5, 0, Math.PI * 2);
          ctx.strokeStyle = isOpen 
            ? `rgba(16, 185, 129, ${0.8 - pulse * 0.5})` 
            : `rgba(100, 116, 139, 0.3)`;
          ctx.lineWidth = isOpen ? 1.5 : 1;
          ctx.stroke();

          // Session Pin Label in Hero Mode
          if (isHero && pt.depth > 0.3) {
            ctx.save();
            const labelText = `${hub.flag} ${hub.name} • ${isOpen ? 'OPEN' : 'CLOSED'}`;
            ctx.font = '800 10px system-ui, sans-serif';
            const metrics = ctx.measureText(labelText);
            const boxWidth = metrics.width + 12;

            ctx.fillStyle = isOpen ? 'rgba(240, 253, 244, 0.95)' : 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = isOpen ? '#10B981' : '#CBD5E1';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(pt.x + 8, pt.y - 14, boxWidth, 18, [4, 4, 4, 4]);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isOpen ? '#047857' : '#475569';
            ctx.fillText(labelText, pt.x + 14, pt.y - 1);
            ctx.restore();
          }
        }
      });

      // Curved Inter-Exchange Flow Arcs between NY, London, and Tokyo
      const hubNY = project(FINANCIAL_MARKET_HUBS[0].lat, FINANCIAL_MARKET_HUBS[0].lon, earthRotAngle);
      const hubLDN = project(FINANCIAL_MARKET_HUBS[1].lat, FINANCIAL_MARKET_HUBS[1].lon, earthRotAngle);
      const hubTKY = project(FINANCIAL_MARKET_HUBS[2].lat, FINANCIAL_MARKET_HUBS[2].lon, earthRotAngle);

      if (hubNY.visible && hubLDN.visible) {
        ctx.beginPath();
        ctx.moveTo(hubNY.x, hubNY.y);
        const midX = (hubNY.x + hubLDN.x) / 2;
        const midY = (hubNY.y + hubLDN.y) / 2 - 25;
        ctx.quadraticCurveTo(midX, midY, hubLDN.x, hubLDN.y);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (hubLDN.visible && hubTKY.visible) {
        ctx.beginPath();
        ctx.moveTo(hubLDN.x, hubLDN.y);
        const midX = (hubLDN.x + hubTKY.x) / 2;
        const midY = (hubLDN.y + hubTKY.y) / 2 - 25;
        ctx.quadraticCurveTo(midX, midY, hubTKY.x, hubTKY.y);
        ctx.strokeStyle = 'rgba(5, 150, 105, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Edge Rim Shading
      const rimShade = ctx.createRadialGradient(
        centerX, centerY, radius * 0.75,
        centerX, centerY, radius
      );
      rimShade.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimShade.addColorStop(0.7, 'rgba(16, 185, 129, 0.15)');
      rimShade.addColorStop(1, 'rgba(4, 120, 87, 0.45)');
      ctx.fillStyle = rimShade;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // End sphere clipping
      ctx.restore();

      // ─── 7. VERTICAL TRADING VOLUME BAR PILLARS (MATCHING JCTRADER IMAGE 1!) ───
      const pillarAlpha = isHero ? 1 : 0.38;
      const pillarWidth = Math.max(16, width / (numBars * 1.5));
      const pillarSpacing = width / numBars;

      for (let i = 0; i < numBars; i++) {
        const cfg = barHeights[i];
        const timeOffset = currentTime * cfg.speed + cfg.phase;
        const dynamicHeight = radius * (0.35 + cfg.baseHeight * 0.65 + 0.12 * Math.sin(timeOffset));
        
        const barX = (i + 0.5) * pillarSpacing;
        const barY = height - dynamicHeight;

        // Vertical gradient: solid bright emerald at base, fading softly towards top
        const barGrad = ctx.createLinearGradient(barX, height, barX, barY);
        barGrad.addColorStop(0, `rgba(16, 185, 129, ${0.7 * pillarAlpha})`);
        barGrad.addColorStop(0.5, `rgba(16, 185, 129, ${0.35 * pillarAlpha})`);
        barGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX - pillarWidth / 2, barY, pillarWidth, dynamicHeight, [6, 6, 0, 0]);
        ctx.fill();

        ctx.strokeStyle = `rgba(5, 150, 105, ${0.5 * pillarAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(barX - pillarWidth / 2 + 2, barY);
        ctx.lineTo(barX + pillarWidth / 2 - 2, barY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const updateClock = () => {
      const d = new Date();
      setTimeString(d.toUTCString().slice(17, 25) + ' UTC');
      setActiveSessions(getAllMarketSessions(d));
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(clockInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  const openCount = activeSessions.filter(s => s.isOpen).length;

  return (
    <div 
      className={`celestial-engine-wrapper ${className}`}
      style={{
        position: mode === 'hero' ? 'relative' : 'fixed',
        inset: mode === 'hero' ? 'auto' : 0,
        width: '100%',
        height: mode === 'hero' ? '540px' : '100%',
        pointerEvents: 'none',
        zIndex: mode === 'hero' ? 1 : 0,
        overflow: 'hidden',
        ...style
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block' 
        }} 
      />

      {/* Hero Mode Celestial Telemetry Badge */}
      {mode === 'hero' && timeString && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid #BBF7D0',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#047857',
          letterSpacing: '0.8px',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: openCount > 0 ? '#10B981' : '#F59E0B',
            boxShadow: `0 0 8px ${openCount > 0 ? '#10B981' : '#F59E0B'}`
          }} />
          <span>
            SUN ORBIT (E→W) // {openCount} SESSION{openCount !== 1 ? 'S' : ''} ACTIVE // {timeString}
          </span>
        </div>
      )}
    </div>
  );
}
