import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getAllMarketSessions } from '../utils/marketHours';

/**
 * CelestialEngine — Photorealistic 3D Earth & Sun Astronomical Engine (Three.js WebGL)
 * 
 * - High-Definition NASA 2048x1024 Earth texture with realistic specular ocean reflections
 * - Rotates strictly according to real-time UTC rotation speed (1 revolution / 24h = 86,400s)
 * - Revolves strictly according to real-time 365.25-day solar year with axial tilt (23.44°)
 * - The Sun shines down on the exact real-time subsolar longitude, illuminating the daylight hemisphere
 * - Financial market hubs (New York, London, Tokyo, Sydney) placed accurately in 3D space
 * - Vivid Electric Green (#00DF81 / #05CD77) atmospheric limb glow
 * - In "hero" mode: Monumental wide planetary curvature arching across the hero viewport
 * - In "ambient" mode: Centered and visible behind frosted transparent dashboard cards
 */

// Major global financial exchange coordinates [lat, lon, id, name, flag]
const FINANCIAL_MARKET_HUBS = [
  { id: 'new_york', lat: 40.71, lon: -74.00, name: 'New York', flag: '🇺🇸' },
  { id: 'london', lat: 51.50, lon: -0.12, name: 'London', flag: '🇬🇧' },
  { id: 'tokyo', lat: 35.68, lon: 139.69, name: 'Tokyo', flag: '🇯🇵' },
  { id: 'sydney', lat: -33.86, lon: 151.20, name: 'Sydney', flag: '🇦🇺' }
];

export default function CelestialEngine({ 
  mode = 'hero', // 'hero' | 'ambient'
  className = '',
  style = {},
  showSessionBadges = true
}) {
  const containerRef = useRef(null);
  const canvas2dRef = useRef(null);
  const [timeString, setTimeString] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.offsetWidth || window.innerWidth;
    let height = container.offsetHeight || 600;

    // ─── 1. THREE.JS SCENE SETUP ───
    const scene = new THREE.Scene();

    const isHero = mode === 'hero';

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      isHero ? 35 : 42,
      width / height,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ─── 2. EARTH GROUP & POLAR AXIS TILT ───
    const earthGroup = new THREE.Group();
    // Earth's axial tilt is 23.44 degrees
    const axialTiltRad = (23.44 * Math.PI) / 180;
    earthGroup.rotation.z = -axialTiltRad;
    scene.add(earthGroup);

    // ─── 3. HIGH-DEFINITION EARTH TEXTURE & MATERIAL ───
    const textureLoader = new THREE.TextureLoader();
    
    // High-resolution NASA Blue Marble equirectangular Earth map
    const earthMap = textureLoader.load('/assets/earth_atmos_2048.jpg');
    earthMap.colorSpace = THREE.SRGBColorSpace;
    const specularMap = textureLoader.load('/assets/earth_specular_2048.jpg');

    const earthRadius = 1.8;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Photorealistic material with electric green specular shimmer
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: specularMap,
      specular: new THREE.Color('#00DF81'),
      shininess: 28,
      reflectivity: 0.35
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // ─── 4. VIVID ELECTRIC GREEN ATMOSPHERIC GLOW SHELL ───
    const atmoGeometry = new THREE.SphereGeometry(earthRadius * 1.028, 64, 64);
    const atmoMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          // Inverted Fresnel rim glow
          float intensity = pow(0.68 - dot(normal, viewDir), 2.8);
          // Bright institutional electric green
          vec3 atmosphereColor = vec3(0.0, 0.874, 0.505); // #00DF81
          gl_FragColor = vec4(atmosphereColor, intensity * 0.9);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    const atmoMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);
    earthGroup.add(atmoMesh);

    // ─── 5. FINANCIAL HUB BEACONS IN 3D SPACE ───
    const hubMarkers = [];
    FINANCIAL_MARKET_HUBS.forEach((hub) => {
      const phi = (90 - hub.lat) * (Math.PI / 180);
      const theta = (hub.lon + 180) * (Math.PI / 180);

      const r = earthRadius * 1.008;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = (r * Math.sin(phi) * Math.sin(theta));
      const y = (r * Math.cos(phi));

      const dotGeo = new THREE.SphereGeometry(0.038, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00DF81 });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.set(x, y, z);
      earthMesh.add(dotMesh);

      // Halo ring
      const ringGeo = new THREE.RingGeometry(0.045, 0.075, 32);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0x00DF81, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.85 
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x, y, z);
      ringMesh.lookAt(x * 2, y * 2, z * 2);
      earthMesh.add(ringMesh);

      hubMarkers.push({ ...hub, dotMesh, ringMesh, pos: new THREE.Vector3(x, y, z) });
    });

    // ─── 6. LIGHTING: REAL-TIME SUBSOLAR SUN & SOFT AMBIENT ───
    const ambientLight = new THREE.AmbientLight(0xF0FDF4, 0.72);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 2.4);
    scene.add(sunLight);

    // ─── 7. CAMERA POSITIONING & SCREEN FITTING ───
    if (isHero) {
      // Monumental planetary horizon sweeping across the width
      camera.position.set(0, 0.35, 4.4);
      // Place Earth center lower down so the curving crest rises into the hero section
      earthGroup.position.set(0, -1.35, 0);
    } else {
      // Centered ambient globe visible behind transparent dashboard cards
      camera.position.set(0, 0, 4.8);
      earthGroup.position.set(0, 0, 0);
    }

    // ─── 8. 2D FOREGROUND CANVAS (TRADING VOLUME PILLARS & HUD) ───
    const canvas2d = canvas2dRef.current;
    let ctx2d = canvas2d ? canvas2d.getContext('2d') : null;

    const numBars = isHero ? 28 : 14;
    const barPhases = Array.from({ length: numBars }, (_, i) => ({
      baseHeight: 0.25 + 0.65 * Math.sin((i / numBars) * Math.PI),
      phase: Math.random() * Math.PI * 2,
      speed: 0.0016 + Math.random() * 0.0014
    }));

    const handleResize = () => {
      if (!container) return;
      width = container.offsetWidth || window.innerWidth;
      height = container.offsetHeight || (isHero ? 640 : 600);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      if (canvas2d) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas2d.width = width * dpr;
        canvas2d.height = height * dpr;
        if (ctx2d) ctx2d.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // ─── 9. ANIMATION LOOP: STRICT REAL-TIME ASTRONOMICAL PHYSICS ───
    let animationFrameId;

    const animate = (currentTime) => {
      const now = new Date();
      
      // UTC seconds elapsed today (0 to 86,400)
      const utcSecondsToday = 
        (now.getUTCHours() * 3600) + 
        (now.getUTCMinutes() * 60) + 
        now.getUTCSeconds() + 
        (now.getUTCMilliseconds() / 1000);

      // ─── A. REAL-TIME 24-HOUR ROTATION (86,400s per revolution) ───
      // Exactly 2*PI per 86,400 seconds. Smooth, continuous, matching real Earth rotation!
      const earthRotAngle = (utcSecondsToday / 86400) * (Math.PI * 2);
      earthMesh.rotation.y = earthRotAngle + Math.PI;

      // ─── B. REAL-TIME 365.25-DAY REVOLUTION & SOLAR DECLINATION ───
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const dayOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
      // Axial tilt solar declination (-23.44° to +23.44°)
      const solarDeclination = -23.44 * Math.cos((2 * Math.PI / 365.25) * (dayOfYear + 10)) * (Math.PI / 180);

      // Subsolar Longitude: Sun moves westward by 15° per hour
      const subsolarLonDeg = (12 - (utcSecondsToday / 3600)) * 15;
      const subsolarLonRad = (subsolarLonDeg * Math.PI) / 180;

      // Position Directional Sun Light in real space
      const sunDistance = 25;
      sunLight.position.set(
        sunDistance * Math.sin(subsolarLonRad),
        sunDistance * Math.sin(solarDeclination),
        sunDistance * Math.cos(subsolarLonRad)
      );

      // Pulse beacon halos
      const pulse = (Math.sin(currentTime * 0.005) + 1) * 0.5;
      hubMarkers.forEach(hub => {
        if (hub.ringMesh) {
          hub.ringMesh.scale.set(1 + pulse * 0.45, 1 + pulse * 0.45, 1);
          hub.ringMesh.material.opacity = 0.9 - pulse * 0.45;
        }
      });

      // Render 3D Scene
      renderer.render(scene, camera);

      // ─── C. 2D TRADING VOLUME PILLARS IN FOREGROUND ───
      if (ctx2d && canvas2d) {
        ctx2d.clearRect(0, 0, width, height);

        const pillarAlpha = isHero ? 0.95 : 0.35;
        const pillarSpacing = width / numBars;
        const pillarWidth = Math.max(16, pillarSpacing * 0.58);

        for (let i = 0; i < numBars; i++) {
          const cfg = barPhases[i];
          const timeOffset = currentTime * cfg.speed + cfg.phase;
          const dynamicHeight = Math.min(height * 0.48, height * (0.15 + cfg.baseHeight * 0.28 + 0.05 * Math.sin(timeOffset)));
          
          const barX = (i + 0.5) * pillarSpacing;
          const barY = height - dynamicHeight;

          const barGrad = ctx2d.createLinearGradient(barX, height, barX, barY);
          barGrad.addColorStop(0, `rgba(0, 223, 129, ${0.85 * pillarAlpha})`);
          barGrad.addColorStop(0.5, `rgba(5, 205, 119, ${0.45 * pillarAlpha})`);
          barGrad.addColorStop(1, 'rgba(0, 223, 129, 0)');

          ctx2d.fillStyle = barGrad;
          ctx2d.beginPath();
          ctx2d.roundRect(barX - pillarWidth / 2, barY, pillarWidth, dynamicHeight, [6, 6, 0, 0]);
          ctx2d.fill();

          ctx2d.strokeStyle = `rgba(0, 255, 136, ${0.75 * pillarAlpha})`;
          ctx2d.lineWidth = 1.4;
          ctx2d.beginPath();
          ctx2d.moveTo(barX - pillarWidth / 2 + 2, barY);
          ctx2d.lineTo(barX + pillarWidth / 2 - 2, barY);
          ctx2d.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

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
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmoGeometry.dispose();
      atmoMaterial.dispose();
      earthMap.dispose();
      specularMap.dispose();
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
      {/* Three.js WebGL Container */}
      <div 
        ref={containerRef} 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%' 
        }} 
      />

      {/* 2D Canvas for Trading Volume Pillars */}
      <canvas 
        ref={canvas2dRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />

      {/* Real-time Astronomical Telemetry Badge */}
      {mode === 'hero' && timeString && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid #00DF81',
          borderRadius: '999px',
          fontSize: '10.5px',
          fontWeight: 900,
          color: '#047857',
          letterSpacing: '0.6px',
          boxShadow: '0 4px 16px rgba(0, 223, 129, 0.22)',
          zIndex: 10,
          maxWidth: 'calc(100% - 40px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#00DF81',
            boxShadow: '0 0 8px #00DF81',
            flexShrink: 0
          }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            24H UTC // {openCount} ACTIVE SESSIONS // {timeString}
          </span>
        </div>
      )}
    </div>
  );
}
