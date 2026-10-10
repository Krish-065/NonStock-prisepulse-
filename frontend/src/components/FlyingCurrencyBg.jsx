import { useEffect, useRef } from 'react';

export default function FlyingCurrencyBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Load dollar bill image texture
    const billImg = new Image();
    billImg.src = '/dollar_note_asset.png';
    let isImgLoaded = false;
    billImg.onload = () => {
      isImgLoaded = true;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Bill particle class
    const bills = [];
    const numBills = 22; // smooth performance count

    for (let i = 0; i < numBills; i++) {
      bills.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 40 + Math.random() * 50,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -0.5 - Math.random() * 1.2, // drifting upwards
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
        opacity: 0.15 + Math.random() * 0.25,
        scaleZ: 0.5 + Math.random() * 0.5,
        zSpeed: (Math.random() - 0.5) * 0.005,
      });
    }

    // Glowing financial light particles
    const particles = [];
    const numParticles = 40;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 1 + Math.random() * 2.5,
        speedY: -0.3 - Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.5,
        color: Math.random() < 0.34 
          ? 'rgba(0, 242, 254, ' 
          : Math.random() < 0.67 
          ? 'rgba(121, 40, 202, ' 
          : 'rgba(255, 215, 0, ',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render glowing financial ambient particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render flying 3D bills
      bills.forEach((b) => {
        b.y += b.speedY;
        b.x += b.speedX + Math.sin(b.wobble) * 0.4;
        b.wobble += b.wobbleSpeed;
        b.rotation += b.rotationSpeed;
        b.scaleZ += b.zSpeed;
        if (b.scaleZ > 1 || b.scaleZ < 0.3) b.zSpeed = -b.zSpeed;

        // Wrap around screen boundaries
        if (b.y < -100) {
          b.y = canvas.height + 100;
          b.x = Math.random() * canvas.width;
        }
        if (b.x < -100) b.x = canvas.width + 100;
        if (b.x > canvas.width + 100) b.x = -100;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.scale(b.scaleZ, Math.cos(b.wobble) * b.scaleZ); // 3D flip effect
        ctx.globalAlpha = b.opacity;

        if (isImgLoaded) {
          ctx.drawImage(billImg, -b.size, -b.size / 2, b.size * 2, b.size);
        } else {
          // Canvas vector dollar note fallback
          ctx.fillStyle = '#065f46';
          ctx.strokeStyle = '#FDBA74';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-b.size, -b.size / 2, b.size * 2, b.size, 6);
          ctx.fill();
          ctx.stroke();

          // Inner emblem & dollar sign
          ctx.fillStyle = '#EA580C';
          ctx.beginPath();
          ctx.arc(0, 0, b.size * 0.28, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.floor(b.size * 0.35)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
