import React, { useEffect, useRef, useState } from 'react';

/**
 * CelestialEngine — Real-Time Astronomical Earth & Orbital Sun Component
 * - Projects a 3D orthographic rotating Earth linked to actual UTC time
 * - Features an orbital Sun moving behind the celestial horizon with dynamic solar corona
 * - Renders dynamic vertical trading bar graph pillars rising from the globe
 * - Adapts to Light Mode (crisp white, emerald green, and black text)
 * - Modes: "hero" (landing page centerpiece) and "ambient" (background on all pages)
 */

// Simplified spherical coordinates for Earth's continental landmasses [latitude, longitude]
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

// Major global financial exchange coordinates [lat, lon, name]
const FINANCIAL_HUBS = [
  { lat: 40.71, lon: -74.00, name: 'New York (NYSE)' },
  { lat: 51.50, lon: -0.12, name: 'London (LSE)' },
  { lat: 35.68, lon: 139.69, name: 'Tokyo (TSE)' },
  { lat: 1.35, lon: 103.82, name: 'Singapore (SGX)' },
  { lat: 47.37, lon: 8.54, name: 'Zurich (SIX)' },
  { lat: 50.11, lon: 8.68, name: 'Frankfurt (FWB)' },
  { lat: -33.86, lon: 151.20, name: 'Sydney (ASX)' },
  { lat: 25.20, lon: 55.27, name: 'Dubai (DFM)' }
];

export default function CelestialEngine({ 
  mode = 'hero', // 'hero' | 'ambient'
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    // Handle high DPI displays
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
    // Earth completes 1 rotation (2*PI) in 86,400,000 milliseconds
    const getUtcBaseAngle = () => {
      const now = new Date();
      const msToday = (now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) * 1000 + now.getUTCMilliseconds();
      return (msToday / 86400000) * 2 * Math.PI;
    };

    let continuousAngle = getUtcBaseAngle();
    let sunOrbitAngle = getUtcBaseAngle() * 0.95; // Orbital transit pace
    let lastTime = performance.now();

    // Setup 18 vertical financial bar graph pillars (matching the reference image!)
    const numBars = mode === 'hero' ? 22 : 12;
    const barHeights = Array.from({ length: numBars }, (_, i) => ({
      baseHeight: 0.2 + 0.65 * Math.sin((i / numBars) * Math.PI),
      phase: Math.random() * Math.PI * 2,
      speed: 0.0015 + Math.random() * 0.002
    }));

    // Main animation loop
    const render = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Rotate smoothly: real UTC baseline + gentle visible revolution
      // Visible rotation speed for stunning interactive experience
      const rotationSpeed = mode === 'hero' ? 0.00035 : 0.00015;
      continuousAngle += rotationSpeed * (delta || 16);
      sunOrbitAngle += (rotationSpeed * 0.7) * (delta || 16);

      ctx.clearRect(0, 0, width, height);

      // Sphere geometry configuration
      const isHero = mode === 'hero';
      const radius = isHero 
        ? Math.min(width * 0.42, height * 0.75, 420)
        : Math.min(width * 0.35, height * 0.5, 260);

      const centerX = isHero ? width * 0.5 : width * 0.78;
      const centerY = isHero ? height * 0.96 : height * 0.45; // Hero rises from bottom like reference image

      // ─── 1. ORBITAL SUN BEHIND THE CELESTIAL HORIZON ───
      // Sun travels in a wide celestial orbit behind the upper atmosphere of the Earth
      const sunDistanceX = radius * 1.35;
      const sunDistanceY = radius * 0.85;
      const sunX = centerX + Math.cos(sunOrbitAngle) * sunDistanceX;
      // Keep Sun in upper hemisphere behind Earth
      const sunY = centerY - Math.abs(Math.sin(sunOrbitAngle)) * sunDistanceY - radius * 0.35;

      // Draw Sun Coronas and Radiant Flares
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 0.9);
      if (isHero) {
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sunGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.85)'); // Golden light
        sunGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.4)');  // Warm amber
        sunGrad.addColorStop(0.65, 'rgba(16, 185, 129, 0.15)'); // Emerald corona transition
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
        sunGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.2)');
        sunGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.save();
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core Disc
      ctx.beginPath();
      ctx.arc(sunX, sunY, isHero ? 32 : 18, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFBEB';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = isHero ? 24 : 12;
      ctx.fill();
      ctx.restore();

      // ─── 2. EARTH ATMOSPHERE & RIM LIGHT GLOW ───
      ctx.save();
      const atmoGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.85,
        centerX, centerY, radius * 1.15
      );
      atmoGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)'); // Emerald atmospheric glow
      atmoGrad.addColorStop(0.5, 'rgba(5, 150, 105, 0.12)');
      atmoGrad.addColorStop(0.8, 'rgba(52, 211, 153, 0.04)');
      atmoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Clip drawing strictly to the 3D Earth sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Earth Globe Body: Ethereal Light Ocean Gradient
      const oceanGrad = ctx.createRadialGradient(
        centerX - radius * 0.25, centerY - radius * 0.35, radius * 0.1,
        centerX, centerY, radius
      );
      if (isHero) {
        oceanGrad.addColorStop(0, '#FFFFFF');
        oceanGrad.addColorStop(0.4, '#F0FDF4'); // Mint white
        oceanGrad.addColorStop(0.75, '#DCFCE7'); // Emerald haze
        oceanGrad.addColorStop(1, '#A7F3D0');    // Deep emerald rim
      } else {
        oceanGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        oceanGrad.addColorStop(0.5, 'rgba(240, 253, 244, 0.7)');
        oceanGrad.addColorStop(1, 'rgba(167, 243, 208, 0.5)');
      }

      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // ─── 3. SPHERICAL PROJECTION HELPER ───
      // Converts (lat, lon) degrees to 2D (x, y) with z-depth test
      const project = (latDeg, lonDeg, rotAngle) => {
        const phi = (latDeg * Math.PI) / 180;
        const lambda = (lonDeg * Math.PI) / 180;
        const theta = rotAngle;

        // Orthographic projection formulas
        const x3d = Math.cos(phi) * Math.sin(lambda - theta);
        const y3d = -Math.sin(phi);
        const z3d = Math.cos(phi) * Math.cos(lambda - theta);

        return {
          x: centerX + x3d * radius,
          y: centerY + y3d * radius,
          visible: z3d > 0.05, // Only on the front-facing hemisphere
          depth: z3d
        };
      };

      // ─── 4. LATITUDE & LONGITUDE GEODESIC GRID LINES ───
      ctx.lineWidth = isHero ? 0.9 : 0.6;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';

      // Parallels (Latitude circles)
      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          const pt = project(lat, lon, continuousAngle);
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

      // Meridians (Longitude lines)
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = project(lat, lon, continuousAngle);
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
        // Draw continent fill
        ctx.beginPath();
        let anyVisible = false;
        let firstPt = null;

        polygon.forEach(([lat, lon], idx) => {
          const pt = project(lat, lon, continuousAngle);
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
          ctx.fillStyle = isHero ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(5, 150, 105, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // ─── 6. FINANCIAL EXCHANGE HUBS & ORDER FLOW BEACONS ───
      FINANCIAL_HUBS.forEach((hub) => {
        const pt = project(hub.lat, hub.lon, continuousAngle);
        if (pt.visible) {
          // Beacon pulse dot
          const pulse = (Math.sin(currentTime * 0.004 + hub.lon) + 1) * 0.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3 + pulse * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#059669';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6 + pulse * 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.7 - pulse * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Hub Label in Hero Mode
          if (isHero && pt.depth > 0.4) {
            ctx.fillStyle = '#0F172A';
            ctx.font = '800 9px system-ui, sans-serif';
            ctx.fillText(hub.name, pt.x + 8, pt.y + 3);
          }
        }
      });

      // Curved Inter-Exchange Order Flow Arcs
      const hubA = project(FINANCIAL_HUBS[0].lat, FINANCIAL_HUBS[0].lon, continuousAngle); // NY
      const hubB = project(FINANCIAL_HUBS[1].lat, FINANCIAL_HUBS[1].lon, continuousAngle); // London
      const hubC = project(FINANCIAL_HUBS[2].lat, FINANCIAL_HUBS[2].lon, continuousAngle); // Tokyo

      if (hubA.visible && hubB.visible) {
        ctx.beginPath();
        ctx.moveTo(hubA.x, hubA.y);
        const midX = (hubA.x + hubB.x) / 2;
        const midY = (hubA.y + hubB.y) / 2 - 25;
        ctx.quadraticCurveTo(midX, midY, hubB.x, hubB.y);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (hubB.visible && hubC.visible) {
        ctx.beginPath();
        ctx.moveTo(hubB.x, hubB.y);
        const midX = (hubB.x + hubC.x) / 2;
        const midY = (hubB.y + hubC.y) / 2 - 25;
        ctx.quadraticCurveTo(midX, midY, hubC.x, hubC.y);
        ctx.strokeStyle = 'rgba(5, 150, 105, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Sphere Edge Rim Shading
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

      // ─── 7. VERTICAL FINANCIAL BAR GRAPH PILLARS (MATCHING JCTRADER IMAGE 1!) ───
      // In the reference image, vertical green pillars rise up across the lower horizon of the globe!
      if (isHero) {
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
          barGrad.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
          barGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
          barGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          // Draw pillar with rounded top
          ctx.roundRect(barX - pillarWidth / 2, barY, pillarWidth, dynamicHeight, [6, 6, 0, 0]);
          ctx.fill();

          // Subtle neon crest line at bar top
          ctx.strokeStyle = 'rgba(5, 150, 105, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(barX - pillarWidth / 2 + 2, barY);
          ctx.lineTo(barX + pillarWidth / 2 - 2, barY);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Update real UTC string every second
    const clockInterval = setInterval(() => {
      const d = new Date();
      setTimeString(d.toUTCString().slice(17, 25) + ' UTC');
    }, 1000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(clockInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

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
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #BBF7D0',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#047857',
          letterSpacing: '0.8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
          <span>REAL-TIME CELESTIAL ROTATION // {timeString}</span>
        </div>
      )}
    </div>
  );
}
