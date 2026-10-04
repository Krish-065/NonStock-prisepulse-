import React, { useEffect, useRef, useState } from 'react';
import { getAllMarketSessions } from '../utils/marketHours';

/**
 * CelestialEngine — Real-Time Astronomical Earth & Sun Engine
 * - Rotates strictly according to real-time UTC rotation speed (1 revolution / 24h = 86,400s)
 * - Revolves strictly according to real-time 365.25-day solar year
 * - The Sun shines down on the exact real-time subsolar longitude, illuminating the morning/daylight hemisphere
 * - Areas under the Sun's daylight shine naturally reflect their active trading sessions (NY, London, Tokyo, Sydney)
 * - Vivid Electric Green (#00DF81 / #05CD77 / #00FF88) and crisp white theme
 * - In "hero" mode: Wide monumental planetary horizon filling the hero width right under the text
 * - In "ambient" mode: Centered and visible behind transparent dashboard cards
 */

// Spherical coordinates for Earth's continental landmasses [latitude, longitude]
const CONTINENTS = [
  // North America
  [
    [72, -165], [70, -130], [60, -80], [50, -55], [30, -80], [25, -80], [20, -100], 
    [15, -90], [20, -105], [30, -115], [35, -120], [50, -125], [60, -140], [68, -165]
  ],
  // South America
  [
    [12, -75], [5, -50], [-10, -35], [-25, -45], [-45, -65], [-55, -70], [-40, -75], 
    [-20, -70], [-5, -80], [5, -78]
  ],
  // Eurasia (Europe + Asia)
  [
    [72, 25], [70, 60], [75, 100], [70, 140], [60, 170], [50, 140], [35, 120], 
    [22, 115], [10, 105], [20, 85], [25, 65], [15, 50], [30, 35], [38, 25], 
    [45, 15], [55, 10], [60, 25]
  ],
  // Africa
  [
    [37, -5], [35, 25], [30, 32], [15, 45], [10, 50], [-5, 40], [-34, 25], 
    [-34, 18], [-10, 12], [5, 2], [15, -17], [25, -15]
  ],
  // Australia
  [
    [-12, 130], [-11, 136], [-15, 145], [-25, 150], [-35, 150], [-38, 145], 
    [-35, 115], [-22, 114], [-16, 122]
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

    // Number of vertical pillars across the wide horizon
    const numBars = mode === 'hero' ? 26 : 14;
    const barPhases = Array.from({ length: numBars }, (_, i) => ({
      baseHeight: 0.28 + 0.62 * Math.sin((i / numBars) * Math.PI),
      phase: Math.random() * Math.PI * 2,
      speed: 0.0018 + Math.random() * 0.0015
    }));

    const render = (currentTime) => {
      ctx.clearRect(0, 0, width, height);

      const isHero = mode === 'hero';

      // ─── 1. REAL-TIME ASTRONOMICAL ROTATION & REVOLUTION SPEED ───
      // Earth takes 24 hours (86,400s) for 1 rotation (solar day)
      // Earth takes 365.25 days for 1 revolution (solar year)
      const now = new Date();
      const utcSecondsToday = (now.getUTCHours() * 3600) + (now.getUTCMinutes() * 60) + now.getUTCSeconds() + (now.getUTCMilliseconds() / 1000);
      
      // Real-time astronomical rotational angle: exactly 2*PI per 86,400 seconds
      // Micro-increment keeps smooth continuous 60fps rendering aligned with actual UTC time
      const earthRotAngle = (utcSecondsToday / 86400) * (Math.PI * 2);

      // Real-time solar year revolution (365.25 days)
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const dayOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
      // Solar declination (axial tilt effect between -23.44° and +23.44°)
      const solarDeclination = -23.44 * Math.cos((2 * Math.PI / 365.25) * (dayOfYear + 10)) * (Math.PI / 180);

      // Subsolar Longitude: where the Sun is directly overhead at noon
      // At 12:00 UTC, Sun is at longitude 0° (London/Greenwich)
      // At 00:00 UTC, Sun is at longitude 180° (Pacific)
      // Moves westward by 15° per hour (360° / 24h)
      const subsolarLon = (12 - (utcSecondsToday / 3600)) * 15;
      const sunEastWestAngle = (subsolarLon * Math.PI) / 180;

      // ─── 2. WIDE SCREEN FITTING GEOMETRY ───
      // In Hero mode, make it monumental and wide spanning across the entire hero width!
      let radius, centerX, centerY;
      if (isHero) {
        // Enormous planetary curvature spanning the hero width
        radius = Math.max(width * 0.78, 800);
        centerX = width * 0.5;
        // Top crest of the dome arches right beneath the text at Y = 75px
        centerY = radius + 75;
      } else {
        // Ambient background mode: perfectly centered behind the dashboard
        radius = Math.min(width * 0.44, height * 0.54, 420);
        centerX = width * 0.5;
        centerY = height * 0.52;
      }

      // ─── 3. REVOLVING SUN WITH REAL-TIME EAST-TO-WEST DIURNAL TRANSIT ───
      const sunOrbitRadiusX = radius * 0.95;
      // Sun projects in the sky behind the upper atmosphere based on subsolar position
      const sunX = centerX - Math.sin(sunEastWestAngle) * sunOrbitRadiusX;
      const sunY = isHero 
        ? Math.max(28, 48 + Math.sin(solarDeclination) * 20 - Math.cos(sunEastWestAngle) * 16)
        : centerY - Math.abs(Math.cos(sunEastWestAngle)) * radius * 0.65 - radius * 0.35 + Math.sin(solarDeclination) * 25;

      // Draw Radiant Solar Flares & Corona (Vivid Electric Green & Solar Gold)
      ctx.save();
      const sunCoronaGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 0.85);
      if (isHero) {
        sunCoronaGrad.addColorStop(0, '#FFFFFF');
        sunCoronaGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.95)'); // Solar gold
        sunCoronaGrad.addColorStop(0.28, 'rgba(0, 223, 129, 0.65)');   // Vivid bright electric green
        sunCoronaGrad.addColorStop(0.65, 'rgba(5, 205, 119, 0.25)');  // Radiant aura
        sunCoronaGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        sunCoronaGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
        sunCoronaGrad.addColorStop(0.25, 'rgba(0, 223, 129, 0.45)');
        sunCoronaGrad.addColorStop(0.65, 'rgba(5, 205, 119, 0.18)');
        sunCoronaGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = sunCoronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, radius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Solar Rays radiating into space
      ctx.strokeStyle = 'rgba(0, 223, 129, 0.38)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
        const rayLen = radius * (0.34 + 0.12 * Math.sin(currentTime * 0.0025 + a * 4));
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a) * 24, sunY + Math.sin(a) * 24);
        ctx.lineTo(sunX + Math.cos(a) * rayLen, sunY + Math.sin(a) * rayLen);
        ctx.stroke();
      }

      // Sun Disc Core
      ctx.beginPath();
      ctx.arc(sunX, sunY, isHero ? 36 : 24, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00DF81';
      ctx.shadowBlur = isHero ? 38 : 22;
      ctx.fill();
      ctx.restore();

      // ─── 4. VIVID ELECTRIC GREEN ATMOSPHERIC GLOW AROUND EARTH ───
      ctx.save();
      const atmoGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.9,
        centerX, centerY, radius * 1.22
      );
      // Bright vibrant electric green shade (#00DF81)
      atmoGrad.addColorStop(0, 'rgba(0, 223, 129, 0.55)');
      atmoGrad.addColorStop(0.35, 'rgba(5, 205, 119, 0.32)');
      atmoGrad.addColorStop(0.72, 'rgba(0, 255, 136, 0.12)');
      atmoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ─── 5. EARTH 3D SPHERICAL PROJECTION WITH AXIAL TILT ───
      // Earth's axial tilt = 23.44°
      const tilt = (23.44 * Math.PI) / 180;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      const project = (latDeg, lonDeg, rotAngle) => {
        const phi = (latDeg * Math.PI) / 180;
        const lambda = (lonDeg * Math.PI) / 180;
        const theta = rotAngle;

        // Spherical coordinates
        const x0 = Math.cos(phi) * Math.sin(lambda - theta);
        const y0 = -Math.sin(phi);
        const z0 = Math.cos(phi) * Math.cos(lambda - theta);

        // Apply polar axis tilt
        const x3d = x0;
        const y3d = y0 * cosT - z0 * sinT;
        const z3d = y0 * sinT + z0 * cosT;

        return {
          x: centerX + x3d * radius,
          y: centerY + y3d * radius,
          visible: z3d > 0.02,
          depth: z3d,
          x3d, y3d, z3d
        };
      };

      // Clip strictly inside the Earth sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // ─── 6. DIURNAL SUNLIGHT ILLUMINATION (FROM THE POV OF THE SUN) ───
      // The hemisphere directly under the subsolar point receives bright daylight!
      const sunXNorm = -Math.sin(sunEastWestAngle);
      const sunYNorm = -0.4;
      const sunLightCenterX = centerX + sunXNorm * radius * 0.45;
      const sunLightCenterY = centerY + sunYNorm * radius * 0.45;

      const oceanGrad = ctx.createRadialGradient(
        sunLightCenterX, sunLightCenterY, radius * 0.08,
        centerX, centerY, radius
      );

      // Vivid bright electric green & white gradient
      if (isHero) {
        oceanGrad.addColorStop(0, '#FFFFFF');               // Direct midday sun
        oceanGrad.addColorStop(0.25, '#F0FDF4');            // Morning daylight
        oceanGrad.addColorStop(0.58, 'rgba(0, 223, 129, 0.55)'); // Vibrant electric green daylight limb
        oceanGrad.addColorStop(0.82, 'rgba(5, 205, 119, 0.42)'); // Dawn / Dusk twilight
        oceanGrad.addColorStop(1, '#052e16');              // Deep night horizon
      } else {
        oceanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        oceanGrad.addColorStop(0.35, 'rgba(240, 253, 244, 0.9)');
        oceanGrad.addColorStop(0.72, 'rgba(0, 223, 129, 0.45)');
        oceanGrad.addColorStop(1, 'rgba(5, 205, 119, 0.32)');
      }

      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // ─── 7. GEODESIC GRID: LATITUDE & LONGITUDE PARALLELS ───
      ctx.lineWidth = isHero ? 1.0 : 0.7;
      ctx.strokeStyle = 'rgba(0, 223, 129, 0.32)'; // Bright electric green grid lines

      // Parallels
      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 5) {
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
        for (let lat = -80; lat <= 80; lat += 4) {
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

      // ─── 8. CONTINENT LANDMASS POLYGONS ───
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
          // Vivid electric green fill & crisp outline
          ctx.fillStyle = isHero ? 'rgba(0, 223, 129, 0.42)' : 'rgba(0, 223, 129, 0.28)';
          ctx.fill();
          ctx.strokeStyle = '#05CD77';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      });

      // ─── 9. FINANCIAL HUBS WITH REAL-TIME DAYLIGHT & SESSION BEACONS ───
      const sessions = getAllMarketSessions();

      FINANCIAL_MARKET_HUBS.forEach((hub) => {
        const pt = project(hub.lat, hub.lon, earthRotAngle);
        if (pt.visible) {
          const sessionState = sessions.find(s => s.id === hub.id);
          const isOpen = sessionState?.isOpen || false;
          const isDaylight = sessionState?.isDaylight || false;

          // Pulse animation
          const pulse = (Math.sin(currentTime * 0.005 + hub.lon) + 1) * 0.5;

          // Beacon center dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isOpen ? 4.5 + pulse * 2.5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = isOpen ? '#00DF81' : (isDaylight ? '#F59E0B' : '#64748B');
          ctx.fill();

          // Beacon expanding halo
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isOpen ? 9 + pulse * 6 : 6, 0, Math.PI * 2);
          ctx.strokeStyle = isOpen 
            ? `rgba(0, 223, 129, ${0.9 - pulse * 0.5})` 
            : `rgba(100, 116, 139, 0.35)`;
          ctx.lineWidth = isOpen ? 2 : 1;
          ctx.stroke();

          // Session Pin Pill in Hero Mode
          if (isHero && pt.depth > 0.25) {
            ctx.save();
            const labelText = `${hub.flag} ${hub.name} • ${isOpen ? 'LIVE OPEN' : 'CLOSED'}`;
            ctx.font = '900 11px system-ui, sans-serif';
            const metrics = ctx.measureText(labelText);
            const boxWidth = metrics.width + 16;

            ctx.fillStyle = isOpen ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.88)';
            ctx.strokeStyle = isOpen ? '#00DF81' : '#CBD5E1';
            ctx.lineWidth = isOpen ? 1.8 : 1;
            ctx.beginPath();
            ctx.roundRect(pt.x + 10, pt.y - 14, boxWidth, 20, [6, 6, 6, 6]);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isOpen ? '#047857' : '#475569';
            ctx.fillText(labelText, pt.x + 18, pt.y);
            ctx.restore();
          }
        }
      });

      // Curved Inter-Exchange Financial Flow Arcs (NY -> London -> Tokyo)
      const hubNY = project(FINANCIAL_MARKET_HUBS[0].lat, FINANCIAL_MARKET_HUBS[0].lon, earthRotAngle);
      const hubLDN = project(FINANCIAL_MARKET_HUBS[1].lat, FINANCIAL_MARKET_HUBS[1].lon, earthRotAngle);
      const hubTKY = project(FINANCIAL_MARKET_HUBS[2].lat, FINANCIAL_MARKET_HUBS[2].lon, earthRotAngle);

      if (hubNY.visible && hubLDN.visible) {
        ctx.beginPath();
        ctx.moveTo(hubNY.x, hubNY.y);
        const midX = (hubNY.x + hubLDN.x) / 2;
        const midY = (hubNY.y + hubLDN.y) / 2 - 28;
        ctx.quadraticCurveTo(midX, midY, hubLDN.x, hubLDN.y);
        ctx.strokeStyle = '#00DF81';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (hubLDN.visible && hubTKY.visible) {
        ctx.beginPath();
        ctx.moveTo(hubLDN.x, hubLDN.y);
        const midX = (hubLDN.x + hubTKY.x) / 2;
        const midY = (hubLDN.y + hubTKY.y) / 2 - 28;
        ctx.quadraticCurveTo(midX, midY, hubTKY.x, hubTKY.y);
        ctx.strokeStyle = '#05CD77';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Rim Atmospheric Depth Shading
      const rimShade = ctx.createRadialGradient(
        centerX, centerY, radius * 0.72,
        centerX, centerY, radius
      );
      rimShade.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimShade.addColorStop(0.7, 'rgba(0, 223, 129, 0.22)');
      rimShade.addColorStop(1, 'rgba(4, 120, 87, 0.55)');
      ctx.fillStyle = rimShade;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // End sphere clipping
      ctx.restore();

      // ─── 10. VIVID ELECTRIC GREEN VERTICAL TRADING VOLUME PILLARS ───
      // Spans across the entire wide screen width, rising up from the bottom!
      const pillarAlpha = isHero ? 1 : 0.42;
      const pillarSpacing = width / numBars;
      const pillarWidth = Math.max(18, pillarSpacing * 0.58);

      for (let i = 0; i < numBars; i++) {
        const cfg = barPhases[i];
        const timeOffset = currentTime * cfg.speed + cfg.phase;
        // Dynamic bar heights
        const dynamicHeight = Math.min(height * 0.65, radius * (0.3 + cfg.baseHeight * 0.55 + 0.1 * Math.sin(timeOffset)));
        
        const barX = (i + 0.5) * pillarSpacing;
        const barY = height - dynamicHeight;

        // Vivid electric green vertical gradient: bright at base, fading softly towards top
        const barGrad = ctx.createLinearGradient(barX, height, barX, barY);
        barGrad.addColorStop(0, `rgba(0, 223, 129, ${0.85 * pillarAlpha})`);
        barGrad.addColorStop(0.45, `rgba(5, 205, 119, ${0.45 * pillarAlpha})`);
        barGrad.addColorStop(1, 'rgba(0, 223, 129, 0)');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX - pillarWidth / 2, barY, pillarWidth, dynamicHeight, [8, 8, 0, 0]);
        ctx.fill();

        // Neon Electric Top Edge
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.75 * pillarAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(barX - pillarWidth / 2 + 3, barY);
        ctx.lineTo(barX + pillarWidth / 2 - 3, barY);
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
        height: mode === 'hero' ? '640px' : '100%',
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

      {/* Real-time Astronomical Telemetry Badge */}
      {mode === 'hero' && timeString && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 16px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #00DF81',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 900,
          color: '#047857',
          letterSpacing: '0.8px',
          boxShadow: '0 4px 16px rgba(0, 223, 129, 0.25)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00DF81',
            boxShadow: '0 0 10px #00DF81'
          }} />
          <span>
            24H REAL-TIME UTC ROTATION // {openCount} ACTIVE SESSION{openCount !== 1 ? 'S' : ''} // {timeString}
          </span>
        </div>
      )}
    </div>
  );
}
