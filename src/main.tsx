import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './app/App';
import IntroAnimation from './app/components/IntroAnimation';
import './styles/index.css';

function Root() {
  const [introDone, setIntroDone] = useState(false);
  return (
    <>
      {!introDone && <IntroAnimation onComplete={() => setIntroDone(true)} />}
      {/* App hidden behind intro — visibility preserves layout, avoids flash */}
      <div style={{ visibility: introDone ? 'visible' : 'hidden' }}>
        <App />
      </div>
      <SpeedInsights />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
