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
    const DROP_COUNT = 180;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < DROP_COUNT; i++) {
      drops.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 25 + 10,
        speed: Math.random() * 6 + 8,
        opacity: Math.random() * 0.12 + 0.04,
        width: Math.random() < 0.3 ? 1.5 : 1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        // Slight diagonal angle like real rain
        ctx.lineTo(drop.x + drop.length * 0.15, drop.y + drop.length);
        ctx.strokeStyle = `rgba(0, 0, 0, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += drop.speed * 0.15;

        if (drop.y > canvas!.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas!.width;
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
