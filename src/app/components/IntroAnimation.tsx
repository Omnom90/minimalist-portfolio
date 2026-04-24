import { useState, useEffect, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: Props) {
  const [zooming, setZooming] = useState(false);
  const [whiteIn, setWhiteIn] = useState(false);
  const [done, setDone] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [origin, setOrigin] = useState('50% 50%');

  useEffect(() => {
    const t0 = setTimeout(() => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        setOrigin(
          `${((cx / window.innerWidth) * 100).toFixed(2)}% ${((cy / window.innerHeight) * 100).toFixed(2)}%`
        );
      }
      setZooming(true);
    }, 400);

    // White overlay kicks in near the end of zoom → grey fades to white
    const t1 = setTimeout(() => setWhiteIn(true), 2000);

    // Once white covers everything, snap website in and remove overlay
    const t2 = setTimeout(() => {
      setDone(true);
      onComplete();
    }, 2350);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-white">
      {/* Zoom container */}
      <div
        className="relative w-full h-full"
        style={{
          transformOrigin: origin,
          transform: zooming ? 'scale(60)' : 'scale(1)',
          transition: zooming ? 'transform 2s cubic-bezier(0.12, 0, 0.4, 1)' : undefined,
        }}
      >
        {/* Mountain photo, forced greyscale */}
        <img
          src="/mountain.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(100%)' }}
        />

        {/* O.K. logo — darken blend removes white/off-white box, letters sit on mountains */}
        <div
          className="absolute w-full flex justify-center"
          style={{ top: '22%' }}
        >
          <img
            ref={logoRef}
            src="/ok_real.png"
            alt="O.K."
            draggable={false}
            style={{
              width: 300,
              height: 300,
              objectFit: 'contain',
              mixBlendMode: 'darken',
              filter: 'brightness(1.08) contrast(1.2)',
            }}
          />
        </div>
      </div>

      {/* White fade — covers grey mountains before website is revealed */}
      <div
        className="absolute inset-0 bg-white pointer-events-none"
        style={{
          opacity: whiteIn ? 1 : 0,
          transition: whiteIn ? 'opacity 0.35s ease-in' : undefined,
        }}
      />
    </div>
  );
}
