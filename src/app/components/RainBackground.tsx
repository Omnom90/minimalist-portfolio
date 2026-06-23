import { useEffect, useRef } from 'react';

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

export default function RainBackground() {
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

    for (let i = 0; i < DROP_COUNT; i++) {
      let x: number;
      const edgeBias = Math.random();
      if (edgeBias < 0.3) {
        x = Math.random() * window.innerWidth * 0.20;
      } else if (edgeBias < 0.6) {
        x = window.innerWidth * 0.80 + Math.random() * window.innerWidth * 0.20;
      } else {
        x = Math.random() * window.innerWidth;
      }

      const isEdge = x < window.innerWidth * 0.20 || x > window.innerWidth * 0.80;
      const opacity = isEdge
        ? Math.random() * 0.18 + 0.1
        : Math.random() * 0.08 + 0.02;

      drops.push({
        x,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 12,
        speed: Math.random() * 7 + 9,
        opacity,
        width: isEdge ? (Math.random() < 0.4 ? 2.5 : 1.8) : 1.5,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(0, 0, 0, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > canvas!.height) {
          drop.y = -drop.length;
          const eb = Math.random();
          if (eb < 0.3) {
            drop.x = Math.random() * canvas!.width * 0.20;
          } else if (eb < 0.6) {
            drop.x = canvas!.width * 0.80 + Math.random() * canvas!.width * 0.20;
          } else {
            drop.x = Math.random() * canvas!.width;
          }
          const isEdge = drop.x < canvas!.width * 0.20 || drop.x > canvas!.width * 0.80;
          drop.opacity = isEdge ? Math.random() * 0.18 + 0.1 : Math.random() * 0.08 + 0.02;
          drop.width = isEdge ? (Math.random() < 0.4 ? 2.5 : 1.8) : 1.5;
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
