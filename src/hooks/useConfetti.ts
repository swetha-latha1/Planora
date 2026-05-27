'use client';
import { useCallback, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
  gravity: number;
  drag: number;
}

const COLORS = [
  '#7c6af7','#a78bfa','#06b6d4','#67e8f9',
  '#34d399','#fbbf24','#f472b6','#fb923c',
  '#fff','#c4b5fd',
];

function randomBetween(a: number, b: number) { return a + Math.random() * (b - a); }

function makeParticle(x: number, y: number): Particle {
  const angle = randomBetween(-Math.PI * 0.9, -Math.PI * 0.1);
  const speed = randomBetween(4, 14);
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(5, 11),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.15, 0.15),
    opacity: 1,
    shape: (['rect','rect','circle','star'] as const)[Math.floor(Math.random() * 4)],
    gravity: randomBetween(0.18, 0.35),
    drag: randomBetween(0.97, 0.995),
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    ctx.lineTo(x + (r / 2) * Math.cos(b), y + (r / 2) * Math.sin(b));
  }
  ctx.closePath();
}

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  const launch = useCallback((originX?: number, originY?: number, count = 120) => {
    // Create or reuse canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = originX ?? window.innerWidth  / 2;
    const cy = originY ?? window.innerHeight / 3;

    // Burst from center + two sides
    particles.current = [
      ...Array.from({ length: count },     () => makeParticle(cx, cy)),
      ...Array.from({ length: count / 3 }, () => makeParticle(0, cy)),
      ...Array.from({ length: count / 3 }, () => makeParticle(window.innerWidth, cy)),
    ];

    cancelAnimationFrame(rafRef.current);

    const ctx = canvas.getContext('2d')!;
    const tick = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.current = particles.current.filter(p => p.opacity > 0.02);

      for (const p of particles.current) {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x  += p.vx;
        p.y  += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity  -= 0.008;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, p.size / 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }

      if (particles.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    particles.current = [];
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  return { launch, stop };
}
