import React, { useEffect, useRef, useState } from 'react';
import { getAllMarketSessions } from '../utils/marketHours';

/**
 * CelestialEngine — Real-Time Astronomical Geocentric Earth & Revolving Sun
 * - Earth rotates on its 23.44° tilted polar axis strictly according to real-time:
 *   1 solar day = 24 hours (86,400 seconds) for 360° rotation.
 * - Earth revolves around the Sun over 365.25 days (annual seasonal solar declination cycle).
 * - The Sun's real-time subsolar position (latitude & longitude) illuminates the diurnal
 *   daylight hemisphere, showing exactly which regions and market sessions are in sunlight/active.
 * - Vibrant High-Energy Palette: Bright electric emerald green (#00D26A / #00E676 / #00C853) & crisp white.
 * - Screen Fitting: Ultra-wide panoramic planetary horizon spanning across the screen.
 * - Modes: 'hero' (wide monumental horizon with trading pillars & solar flares) and
 *   'ambient' (glassmorphic backdrop for Dashboard and platform pages).
 */

// High-fidelity spherical continental coordinates [latitude, longitude]
const CONTINENTS = [
  // North America (Alaska, Canada, USA, Mexico, Central America)
  [
    [71, -156], [70, -135], [68, -120], [60, -90], [55, -60], [47, -53], [44, -64],
    [35, -75], [28, -80], [25, -80], [29, -89], [28, -97], [22, -97], [18, -90],
    [15, -88], [9, -79], [8, -83], [14, -92], [18, -104], [23, -110], [32, -117],
    [38, -123], [48, -124], [58, -136], [60, -149], [64, -166], [71, -156]
  ],
  // Greenland
  [
    [76, -68], [82, -30], [70, -22], [60, -43], [66, -53], [76, -68]
  ],
  // South America
  [
    [12, -72], [10, -62], [6, -52], [0, -50], [-5, -35], [-12, -37], [-22, -41],
    [-34, -53], [-45, -65], [-54, -68], [-52, -74], [-40, -74], [-25, -70],
    [-15, -75], [-4, -81], [5, -77], [12, -72]
  ],
  // Europe & Scandinavia
  [
    [71, 28], [68, 44], [60, 30], [55, 21], [54, 14], [51, 3], [48, -4],
    [43, -9], [37, -9], [36, -5], [38, 0], [43, 4], [44, 8], [40, 18],
    [38, 24], [41, 29], [46, 31], [46, 38], [55, 38], [60, 30], [64, 21],
    [70, 20], [71, 28]
  ],
  // British Isles
  [
    [58, -5], [58, -2], [52, 1], [50, -5], [52, -5], [55, -3], [58, -5]
  ],
  // Africa
  [
    [36, -5], [37, 10], [32, 25], [31, 32], [28, 34], [22, 37], [12, 44],
    [12, 51], [2, 46], [-5, 39], [-15, 40], [-25, 33], [-34, 26], [-34, 18],
    [-28, 16], [-18, 12], [-5, 9], [4, 7], [5, 1], [5, -4], [6, -11],
    [14, -17], [21, -17], [28, -13], [36, -5]
  ],
  // Asia (Russia, China, India, SE Asia, Middle East)
  [
    [70, 40], [72, 70], [76, 100], [74, 135], [70, 170], [65, 180], [60, 165],
    [55, 156], [50, 140], [43, 132], [38, 128], [32, 122], [22, 114], [21, 108],
    [10, 103], [1, 104], [6, 99], [13, 101], [21, 89], [16, 82], [8, 77],
    [15, 73], [24, 69], [25, 62], [25, 57], [13, 48], [15, 42], [26, 36],
    [33, 36], [38, 43], [42, 50], [46, 48], [50, 58], [55, 60], [60, 50],
    [65, 42], [70, 40]
  ],
  // Japan Arch
  [
    [45, 142], [43, 145], [38, 141], [35, 136], [33, 131], [35, 133], [40, 140], [45, 142]
  ],
  // Australia & New Zealand
  [
    [-11, 142], [-15, 145], [-24, 153], [-32, 152], [-38, 147], [-37, 138],
    [-34, 135], [-35, 115], [-28, 114], [-22, 114], [-15, 124], [-12, 133],
    [-11, 142]
  ]
];

// Major global financial market exchange hubs [lat, lon, id, name, flag, exchange]
const FINANCIAL_MARKET_HUBS = [
  { id: 'new_york', lat: 40.71, lon: -74.00, name: 'New York', flag: '🇺🇸', exchange: 'NYSE / NASDAQ' },
  { id: 'london', lat: 51.50, lon: -0.12, name: 'London', flag: '🇬🇧', exchange: 'LSE' },
  { id: 'tokyo', lat: 35.68, lon: 139.69, name: 'Tokyo', flag: '🇯🇵', exchange: 'TSE / Nikkei' },
  { id: 'sydney', lat: -33.86, lon: 151.20, name: 'Sydney', flag: '🇦🇺', exchange: 'ASX' },
  { id: 'frankfurt', lat: 50.11, lon: 8.68, name: 'Frankfurt', flag: '🇩🇪', exchange: 'XETRA' },
  { id: 'hong_kong', lat: 22.31, lon: 114.16, name: 'Hong Kong', flag: '🇭🇰', exchange: 'HKEX' },
  { id: 'singapore', lat: 1.35, lon: 103.81, name: 'Singapore', flag: '🇸🇬', exchange: 'SGX' },
  { id: 'mumbai', lat: 19.07, lon: 72.87, name: 'Mumbai', flag: '🇮🇳', exchange: 'NSE / BSE' },
  { id: 'dubai', lat: 25.20, lon: 55.27, name: 'Dubai', flag: '🇦🇪', exchange: 'DFM' },
  { id: 'zurich', lat: 47.37, lon: 8.54, name: 'Zurich', flag: '🇨🇭', exchange: 'SIX' },
  { id: 'toronto', lat: 43.65, lon: -79.38, name: 'Toronto', flag: '🇨🇦', exchange: 'TSX' },
  { id: 'sao_paulo', lat: -23.55, lon: -46.63, name: 'São Paulo', flag: '🇧🇷', exchange: 'B3' },
  { id: 'chicago', lat: 41.87, lon: -87.62, name: 'Chicago', flag: '🇺🇸', exchange: 'CME' }
];

export default function CelestialEngine({
  mode = 'hero', // 'hero' | 'ambient'
  className = '',
  style = {},
  showSessionBadges = true,
  speedMultiplier = 1 // default 1x = strict real-time (24 hours per rotation, 365.25 days per revolution)
}) {
  const canvasRef = useRef(null);
  const [activeSpeed, setActiveSpeed] = useState(speedMultiplier);
  const [telemetry, setTelemetry] = useState({
    timeUtc: '',
    dayFraction: 0,
    subsolarLon: 0,
    subsolarLat: 0,
    openSessionsCount: 0,
    activeNames: []
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Astronomical State Engine
    // Real time baseline anchor
    let baseDate = new Date();
    let animVirtualElapsedMs = 0;
    let lastRenderTime = performance.now();

    // 24 vertical financial trading volume bar graph pillars
    const numBars = mode === 'hero' ? 24 : 14;
    const barData = Array.from({ length: numBars }, (_, i) => ({
      baseHeight: 0.2 + 0.65 * Math.sin(((i + 1) / (numBars + 1)) * Math.PI),
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.0018 + Math.random() * 0.0014
    }));

    const render = (currentTime) => {
      const delta = Math.min(currentTime - lastRenderTime, 100);
      lastRenderTime = currentTime;

      // Virtual astronomical time calculation
      // When activeSpeed === 1: Virtual elapsed time === real wall clock time!
      animVirtualElapsedMs += delta * activeSpeed;
      const now = new Date(baseDate.getTime() + animVirtualElapsedMs);

      // ─── 1. REAL-TIME ASTRONOMICAL ROTATION & REVOLUTION PHYSICS ───
      // A. Earth Rotation (Solar Day = 24 hours = 86,400,000 ms)
      // Greenwich meridian (0° lon) faces the Sun at 12:00 UTC (solar noon)
      const msToday = (now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) * 1000 + now.getUTCMilliseconds();
      const dayFraction = msToday / 86400000; // 0.0 to 1.0 throughout 24 hours

      // Earth rotates West to East. Rate = 2*PI radians per 24 hours.
      // At 12:00 UTC (dayFraction = 0.5), 0° longitude points directly forward towards the Sun.
      const earthRotAngle = (dayFraction - 0.5) * 2 * Math.PI;

      // B. Earth Revolution around the Sun (Solar Year = 365.25 days)
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const dayOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
      const yearFraction = dayOfYear / 365.25;

      // Solar Declination Angle (Earth's 23.44° axial tilt relative to Sun across 365.25 days):
      // March Equinox (~day 80): Declination = 0°
      // June Solstice (~day 172): Declination = +23.44° (Northern Summer)
      // Dec Solstice (~day 355): Declination = -23.44° (Northern Winter)
      const solarDeclinationDeg = 23.44 * Math.sin(((dayOfYear - 80) / 365.25) * 2 * Math.PI);
      const solarDeclinationRad = (solarDeclinationDeg * Math.PI) / 180;

      // Subsolar Longitude (where the Sun is directly at zenith):
      // Since Earth rotates 360° in 24 hours (15°/hour), at 12:00 UTC, subsolarLon = 0°
      const subsolarLonDeg = (12 - (msToday / 3600000)) * 15;

      // ─── 2. VIEWPORT GEOMETRY & SCREEN FITTING ───
      ctx.clearRect(0, 0, width, height);

      const isHero = mode === 'hero';

      // Panoramic Wide Planetary Radius:
      // In Hero mode, make the globe vast and wide across the screen width!
      const radius = isHero
        ? Math.max(width * 0.72, 850)
        : Math.max(width * 0.44, 600);

      // Center X is always perfectly centered
      const centerX = width * 0.5;

      // In Hero mode, the top crest of the Earth (centerY - radius) sits at exactly
      // height * 0.44 so the headline sits majestically just above and over the horizon!
      const horizonY = isHero ? height * 0.44 : height * 0.12;
      const centerY = radius + horizonY;

      // Earth Axial Tilt (23.44°)
      const axisTilt = (23.44 * Math.PI) / 180;
      const cosTilt = Math.cos(axisTilt);
      const sinTilt = Math.sin(axisTilt);

      // 3D Spherical Projection Function:
      // Converts (lat, lon) to tilted 3D Cartesian coordinates
      const project = (latDeg, lonDeg) => {
        const phi = (latDeg * Math.PI) / 180;
        const lambda = (lonDeg * Math.PI) / 180;
        const theta = earthRotAngle;

        // Base 3D on unit sphere
        const x0 = Math.cos(phi) * Math.sin(lambda - theta);
        const y0 = -Math.sin(phi);
        const z0 = Math.cos(phi) * Math.cos(lambda - theta);

        // Apply Earth's 23.44° axial tilt
        const x3d = x0;
        const y3d = y0 * cosTilt - z0 * sinTilt;
        const z3d = y0 * sinTilt + z0 * cosTilt;

        return {
          x: centerX + x3d * radius,
          y: centerY + y3d * radius,
          visible: z3d > 0.02,
          depth: z3d,
          x3d, y3d, z3d
        };
      };

      // Solar Daylight Illumination Calculation at any (lat, lon):
      // Returns cosine of solar zenith angle: >0 means DAYLIGHT, <0 means NIGHT
      const getSolarIllumination = (latDeg, lonDeg) => {
        const phi = (latDeg * Math.PI) / 180;
        const delta = solarDeclinationRad;
        const dLon = ((lonDeg - subsolarLonDeg) * Math.PI) / 180;
        return Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(dLon);
      };

      // ─── 3. RADIANT REVOLVING SUN & CELESTIAL VOLUMETRIC CORONA ───
      // The Sun orbits East to West across the celestial sky above the Earth horizon
      const sunOrbitAngle = -earthRotAngle - Math.PI / 2;
      const sunDistX = radius * 0.52;
      const sunX = centerX + Math.cos(sunOrbitAngle) * sunDistX;
      // Position Sun disc gracefully in the celestial sky above the Earth's horizon
      const sunY = horizonY - 65 + Math.sin(sunOrbitAngle) * 35;

      // Draw Atmospheric Sun Coronas & Flares
      ctx.save();
      const sunGlowRadius = radius * (isHero ? 0.85 : 0.65);
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunGlowRadius);
      if (isHero) {
        sunGrad.addColorStop(0, '#FFFFFF');
        sunGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.95)'); // Solar gold
        sunGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.45)');  // Warm amber
        sunGrad.addColorStop(0.6, 'rgba(0, 210, 106, 0.28)');   // VIBRANT BRIGHT GREEN ATMOSPHERIC REFRACTION
        sunGrad.addColorStop(0.85, 'rgba(0, 230, 118, 0.08)');  // Bright neon emerald mist
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
        sunGrad.addColorStop(0.3, 'rgba(0, 210, 106, 0.18)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Coronal Solar Flare Rays radiating from the Sun
      if (isHero) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.lineWidth = 1.4;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
          const rayLen = radius * (0.38 + 0.16 * Math.sin(currentTime * 0.003 + a * 4));
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(a) * 22, sunY + Math.sin(a) * 22);
          ctx.lineTo(sunX + Math.cos(a) * rayLen, sunY + Math.sin(a) * rayLen);
          ctx.stroke();
        }
      }

      // Sun Core Disc
      ctx.beginPath();
      ctx.arc(sunX, sunY, isHero ? 36 : 22, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF5';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = isHero ? 36 : 20;
      ctx.fill();
      ctx.restore();

      // ─── 4. VIBRANT ATMOSPHERE & EMERALD IONOSPHERE GLOW ───
      ctx.save();
      const atmoGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.85,
        centerX, centerY, radius * 1.25
      );
      // Bright vibrant emerald ionospheric mantle
      atmoGrad.addColorStop(0, 'rgba(0, 210, 106, 0.38)');
      atmoGrad.addColorStop(0.35, 'rgba(0, 230, 118, 0.22)');
      atmoGrad.addColorStop(0.7, 'rgba(5, 223, 114, 0.08)');
      atmoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ─── 5. 3D EARTH SPHERE CLIPPING & OCEAN SURFACE ───
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Dynamic Diurnal Ocean Gradient:
      // The light shifts according to the Sun's position relative to the viewing plane
      const sunDirX = (sunX - centerX) / (radius * 1.2);
      const sunDirY = (sunY - centerY) / (radius * 1.2);

      const oceanGrad = ctx.createRadialGradient(
        centerX + sunDirX * radius * 0.45,
        centerY + sunDirY * radius * 0.45,
        radius * 0.08,
        centerX, centerY, radius
      );

      if (isHero) {
        oceanGrad.addColorStop(0, '#FFFFFF');              // Solar noon daylight core
        oceanGrad.addColorStop(0.3, '#F0FDF4');            // Crystalline mint daylight
        oceanGrad.addColorStop(0.65, '#BBF7D0');           // Vibrant emerald transition
        oceanGrad.addColorStop(0.9, '#4ADE80');            // Bright emerald mantle
        oceanGrad.addColorStop(1, '#00D26A');              // Electric emerald planetary limb
      } else {
        oceanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        oceanGrad.addColorStop(0.4, 'rgba(240, 253, 244, 0.85)');
        oceanGrad.addColorStop(0.8, 'rgba(187, 247, 208, 0.65)');
        oceanGrad.addColorStop(1, 'rgba(0, 210, 106, 0.45)');
      }

      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // ─── 6. GEODESIC GRID: PARALLELS & MERIDIANS ───
      ctx.lineWidth = isHero ? 1.0 : 0.7;
      ctx.strokeStyle = 'rgba(0, 210, 106, 0.32)'; // Bright vivid green coordinate lines

      // Parallels: Equator, Tropics, and Arctic/Antarctic
      [-66.5, -45, -23.44, 0, 23.44, 45, 66.5].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        const isEquatorOrTropic = Math.abs(lat) === 0 || Math.abs(lat) === 23.44;
        ctx.lineWidth = isEquatorOrTropic ? (isHero ? 1.4 : 1.0) : 0.8;
        ctx.strokeStyle = isEquatorOrTropic
          ? 'rgba(0, 200, 83, 0.48)'
          : 'rgba(0, 210, 106, 0.22)';

        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lat, lon);
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

      // Meridians every 30°
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        const isGreenwich = lon === 0;
        ctx.lineWidth = isGreenwich ? (isHero ? 1.6 : 1.1) : 0.8;
        ctx.strokeStyle = isGreenwich
          ? 'rgba(0, 200, 83, 0.52)'
          : 'rgba(0, 210, 106, 0.22)';

        for (let lat = -80; lat <= 80; lat += 4) {
          const pt = project(lat, lon);
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

      // ─── 7. CONTINENTAL LANDMASSES WITH DIURNAL DAYLIGHT ILLUMINATION ───
      CONTINENTS.forEach((polygon) => {
        ctx.beginPath();
        let anyVisible = false;
        let firstPt = null;

        polygon.forEach(([lat, lon]) => {
          const pt = project(lat, lon);
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
          // Landmass fill: Vibrant bright emerald
          ctx.fillStyle = isHero
            ? 'rgba(0, 210, 106, 0.42)'
            : 'rgba(0, 210, 106, 0.26)';
          ctx.fill();

          // Border outline: Crisp vibrant jade
          ctx.strokeStyle = isHero
            ? 'rgba(0, 158, 71, 0.85)'
            : 'rgba(0, 158, 71, 0.65)';
          ctx.lineWidth = isHero ? 1.6 : 1.1;
          ctx.stroke();
        }
      });

      // ─── 8. LIVE FINANCIAL HUBS (NEW YORK, LONDON, TOKYO, SYDNEY) ───
      const allSessions = getAllMarketSessions(now);
      const activeHubNames = [];

      FINANCIAL_MARKET_HUBS.forEach((hub) => {
        const pt = project(hub.lat, hub.lon);
        const sessionState = allSessions.find(s => s.id === hub.id);
        const isOpen = sessionState?.isOpen || false;
        const illumination = getSolarIllumination(hub.lat, hub.lon);
        const isSunlit = illumination > 0;

        if (isOpen) {
          activeHubNames.push(hub.name);
        }

        if (pt.visible) {
          // Beacon pulse animation
          const pulse = (Math.sin(currentTime * 0.006 + hub.lon) + 1) * 0.5;

          // Main Beacon Dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isOpen ? 5.5 + pulse * 3 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isOpen
            ? '#00E676' // ELECTRIC NEON GREEN FOR OPEN MARKETS
            : (isSunlit ? '#F59E0B' : '#64748B');
          ctx.shadowColor = isOpen ? '#00E676' : '#F59E0B';
          ctx.shadowBlur = isOpen ? 16 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Outer Radar Rings for Open Markets
          if (isOpen) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 11 + pulse * 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 230, 118, ${0.9 - pulse * 0.6})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }

          // Session Pin Callout Tag in Hero Mode
          if (isHero && pt.depth > 0.15 && showSessionBadges) {
            ctx.save();
            const statusText = isOpen ? 'OPEN' : (isSunlit ? 'DAYLIGHT' : 'CLOSED');
            const labelText = `${hub.flag} ${hub.name} • ${statusText}`;
            ctx.font = '800 11px Inter, system-ui, sans-serif';
            const metrics = ctx.measureText(labelText);
            const boxWidth = metrics.width + 16;
            const boxHeight = 22;
            const tagX = pt.x + 10;
            const tagY = pt.y - 14;

            // Glassmorphic badge card
            ctx.fillStyle = isOpen
              ? 'rgba(240, 253, 244, 0.96)'
              : 'rgba(255, 255, 255, 0.92)';
            ctx.strokeStyle = isOpen ? '#00D26A' : '#CBD5E1';
            ctx.lineWidth = isOpen ? 1.5 : 1;
            ctx.beginPath();
            ctx.roundRect(tagX, tagY, boxWidth, boxHeight, [6, 6, 6, 6]);
            ctx.fill();
            ctx.stroke();

            // Status indicator dot inside label
            ctx.beginPath();
            ctx.arc(tagX + 8, tagY + 11, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = isOpen ? '#00D26A' : '#94A3B8';
            ctx.fill();

            // Text
            ctx.fillStyle = isOpen ? '#006C2E' : '#334155';
            ctx.fillText(labelText, tagX + 16, tagY + 15);
            ctx.restore();
          }
        }
      });

      // Inter-Exchange Liquidity Flow Arcs (London ↔ NY ↔ Tokyo)
      const hubNY = project(FINANCIAL_MARKET_HUBS[0].lat, FINANCIAL_MARKET_HUBS[0].lon);
      const hubLDN = project(FINANCIAL_MARKET_HUBS[1].lat, FINANCIAL_MARKET_HUBS[1].lon);
      const hubTKY = project(FINANCIAL_MARKET_HUBS[2].lat, FINANCIAL_MARKET_HUBS[2].lon);

      if (hubNY.visible && hubLDN.visible) {
        ctx.beginPath();
        ctx.moveTo(hubNY.x, hubNY.y);
        const midX = (hubNY.x + hubLDN.x) / 2;
        const midY = (hubNY.y + hubLDN.y) / 2 - 32;
        ctx.quadraticCurveTo(midX, midY, hubLDN.x, hubLDN.y);
        ctx.strokeStyle = 'rgba(0, 210, 106, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (hubLDN.visible && hubTKY.visible) {
        ctx.beginPath();
        ctx.moveTo(hubLDN.x, hubLDN.y);
        const midX = (hubLDN.x + hubTKY.x) / 2;
        const midY = (hubLDN.y + hubTKY.y) / 2 - 32;
        ctx.quadraticCurveTo(midX, midY, hubTKY.x, hubTKY.y);
        ctx.strokeStyle = 'rgba(0, 200, 83, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ─── 9. PLANETARY RIM SHADOW & VIBRANT HORIZON EDGE ───
      const rimShade = ctx.createRadialGradient(
        centerX, centerY, radius * 0.76,
        centerX, centerY, radius
      );
      rimShade.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimShade.addColorStop(0.7, 'rgba(0, 210, 106, 0.18)');
      rimShade.addColorStop(1, 'rgba(0, 135, 54, 0.55)');

      ctx.fillStyle = rimShade;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // End Earth sphere clipping
      ctx.restore();

      // ─── 10. VERTICAL TRADING VOLUME BAR PILLARS (MATCHING REFERENCE IMAGE) ───
      const pillarAlpha = isHero ? 1 : 0.32;
      const pillarWidth = Math.max(18, width / (numBars * 1.45));
      const pillarSpacing = width / numBars;

      for (let i = 0; i < numBars; i++) {
        const cfg = barData[i];
        const timeOffset = currentTime * cfg.pulseSpeed + cfg.phase;
        const maxPillarHeight = isHero ? Math.min(190, height * 0.24) : Math.min(100, height * 0.15);
        const dynamicHeight = maxPillarHeight * (0.35 + cfg.baseHeight * 0.55 + 0.10 * Math.sin(timeOffset));

        const barX = (i + 0.5) * pillarSpacing;
        const barY = height - dynamicHeight;

        // Vertical gradient: Solid vibrant electric emerald at base, fading softly towards top
        const barGrad = ctx.createLinearGradient(barX, height, barX, barY);
        barGrad.addColorStop(0, `rgba(0, 210, 106, ${0.85 * pillarAlpha})`);
        barGrad.addColorStop(0.5, `rgba(0, 230, 118, ${0.42 * pillarAlpha})`);
        barGrad.addColorStop(1, 'rgba(0, 210, 106, 0)');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX - pillarWidth / 2, barY, pillarWidth, dynamicHeight, [6, 6, 0, 0]);
        ctx.fill();

        // Glowing Cap on top of bar pillar
        ctx.strokeStyle = `rgba(0, 230, 118, ${0.9 * pillarAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(barX - pillarWidth / 2 + 2, barY);
        ctx.lineTo(barX + pillarWidth / 2 - 2, barY);
        ctx.stroke();
      }

      // Update state telemetry periodically
      if (Math.random() < 0.05) {
        setTelemetry({
          timeUtc: now.toUTCString().slice(17, 25) + ' UTC',
          dayFraction: (dayFraction * 100).toFixed(1),
          subsolarLon: subsolarLonDeg.toFixed(1),
          subsolarLat: solarDeclinationDeg.toFixed(1),
          openSessionsCount: activeHubNames.length,
          activeNames: activeHubNames
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, activeSpeed, showSessionBadges]);

  return (
    <div
      className={`celestial-engine-wrapper ${className}`}
      style={{
        position: mode === 'hero' ? 'absolute' : 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: mode === 'hero' ? 0 : 0,
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
      {mode === 'hero' && telemetry.timeUtc && (
        <div style={{
          position: 'absolute',
          bottom: '18px',
          right: '24px',
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 18px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid #86EFAC',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#006C2E',
          letterSpacing: '0.6px',
          boxShadow: '0 4px 18px rgba(0, 210, 106, 0.25)',
          zIndex: 20
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: telemetry.openSessionsCount > 0 ? '#00D26A' : '#F59E0B',
            boxShadow: `0 0 10px ${telemetry.openSessionsCount > 0 ? '#00D26A' : '#F59E0B'}`
          }} />

          <span>
            REAL-TIME UTC: {telemetry.timeUtc} // ROTATION: 24h // {telemetry.openSessionsCount} SESSION{telemetry.openSessionsCount !== 1 ? 'S' : ''} ACTIVE {telemetry.activeNames.length > 0 ? `(${telemetry.activeNames.join(', ')})` : ''}
          </span>

          {/* Interactive Speed Toggle */}
          <button
            onClick={() => setActiveSpeed(prev => prev === 1 ? 360 : 1)}
            style={{
              background: activeSpeed === 1 ? '#F0FDF4' : '#00D26A',
              color: activeSpeed === 1 ? '#008736' : '#FFFFFF',
              border: '1px solid #86EFAC',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 900,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={activeSpeed === 1 ? 'Click to preview fast 360x diurnal orbit' : 'Click to lock to 1:1 strict real-time'}
          >
            {activeSpeed === 1 ? '⚡ 1x Real-Time' : '🚀 360x Fast Demo'}
          </button>
        </div>
      )}
    </div>
  );
}
