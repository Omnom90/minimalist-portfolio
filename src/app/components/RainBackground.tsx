import { useEffect, useRef, type RefObject } from 'react';

type Band = 'left' | 'right' | 'mid';

interface Drop {
  band: Band;
  // Position within the band (0–1), so drops follow the band as the text shifts
  t: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

interface RainBackgroundProps {
  // Text column to keep the heavy edge rain beside; falls back to 20% / 80% of the screen
  contentRef?: RefObject<HTMLElement | null>;
}

export default function RainBackground({ contentRef }: RainBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const drops: Drop[] = [];
    const DROP_COUNT = 420;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Edge bands sit outside the text column; re-measured every frame so they track the slide
    function getBounds() {
      const w = canvas!.width;
      const rect = contentRef?.current?.getBoundingClientRect();
      if (!rect) return { left: w * 0.20, right: w * 0.80 };
      return { left: Math.max(0, rect.left), right: Math.min(w, rect.right) };
    }

    function styleDrop(drop: Drop) {
      const eb = Math.random();
      drop.band = eb < 0.3 ? 'left' : eb < 0.6 ? 'right' : 'mid';
      drop.t = Math.random();
      const isEdge = drop.band !== 'mid';
      drop.opacity = isEdge ? Math.random() * 0.18 + 0.1 : Math.random() * 0.08 + 0.02;
      drop.width = isEdge ? (Math.random() < 0.4 ? 2.5 : 1.8) : 1.5;
    }

    for (let i = 0; i < DROP_COUNT; i++) {
      const drop: Drop = {
        band: 'mid',
        t: 0,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 12,
        speed: Math.random() * 7 + 9,
        opacity: 0,
        width: 1.5,
      };
      styleDrop(drop);
      drops.push(drop);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      const { left, right } = getBounds();
      const w = canvas!.width;

      drops.forEach((drop) => {
        const x = drop.band === 'left'
          ? drop.t * left
          : drop.band === 'right'
            ? right + drop.t * (w - right)
            : drop.t * w;

        ctx.beginPath();
        ctx.moveTo(x, drop.y);
        ctx.lineTo(x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(0, 0, 0, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > canvas!.height) {
          drop.y = -drop.length;
          styleDrop(drop);
        }
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
