import { useState, useRef, useEffect, useCallback } from 'react';
import StormBackground from './components/StormBackground';
import RainBackground from './components/RainBackground';
import eldenRingImg from '../assets/eldenring.jpg';
import pivyrImg from '../assets/pivyr.png';
import soarBarImg from '../assets/soarbar.png';
import charlesImg from '../assets/charles.jpg';
import cadeImg from '../assets/cade.jpg';
import authorImg from '../assets/author.jpg';
import contentCreatorVideo0 from '../assets/content-creator.mp4';
import contentCreatorVideo1 from '../assets/content-creator-1.mp4';
import contentCreatorVideo2 from '../assets/content-creator-2.mp4';
import minecraft from '../assets/minecraft.png';
//import { SpeedInsights } from "@vercel/speed-insights/next"

interface HoverState {
  company: string | null;
  personal: string | null;
  sports: string | null;
  author: boolean;
  aiPictures: boolean;
}

export default function App() {
  const [hoverState, setHoverState] = useState<HoverState>({
    company: null,
    personal: null,
    sports: null,
    author: false,
    aiPictures: false,
  });

  const [darkMode, setDarkMode] = useState(false);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeCompanyRef = useRef<string | null>(null);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Content creator video refs & sequential playback state
  const contentCreatorVideos = [contentCreatorVideo0, contentCreatorVideo2, contentCreatorVideo1];
  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const videoRef2 = useRef<HTMLVideoElement | null>(null);
  const videoRefs = [videoRef0, videoRef1, videoRef2];
  const [activeVideoIndex, setActiveVideoIndex] = useState(-1);
  const isContentCreator = hoverState.personal === 'content creator';

  const companyUrls: Record<string, string> = {
    'Eaton': 'https://www.eaton.com/us/en-us/company/news-insights/what-matters.html',
    'Pivyr': 'https://www.pivyr.com/',
    'MeaVana': 'https://www.meavana.com',
    'Rishfits': 'https://rishfits.ptflow.io/',
    'Soar Bars': 'https://soarbars.com/',
    'Praxigen': 'https://praxigen.dev/',
  };

  // Companies that block iframe embedding
  const noIframeCompanies = new Set(['Eaton', 'Pivyr', 'Soar Bars']);

  const personalContent: Record<string, { image?: string; description?: string }> = {
    'Elden Ring': { image: eldenRingImg },
  };

  // Sequential video playback: when content creator is hovered, start video 0
  useEffect(() => {
    if (isContentCreator) {
      setActiveVideoIndex(0);
    } else {
      setActiveVideoIndex(-1);
      // Pause and reset all videos when hover ends
      videoRefs.forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    }
  }, [isContentCreator]);

  // When activeVideoIndex changes, pause previous and play new video
  useEffect(() => {
    if (activeVideoIndex < 0 || activeVideoIndex > 2) return;
    // Pause all other videos (don't reset their time)
    videoRefs.forEach((ref, i) => {
      if (i !== activeVideoIndex && ref.current) {
        ref.current.pause();
      }
    });
    const videoEl = videoRefs[activeVideoIndex]?.current;
    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => { });
    }
  }, [activeVideoIndex]);

  // Called when a video ends — just stop, don't auto-advance
  const handleVideoEnded = useCallback((_index: number) => {
    // Do nothing — user clicks to advance
  }, []);

  const sportsContent: Record<string, { image: string; description: string }> = {
    'Charles "Do Bronx" Oliveira': {
      image: charlesImg,
      description: "The Champion Has A Name! Charles vs Gaethji was the first ufc fight I wathced. His upbringing, story, and what he fights for is truly inspiring. He came from being known as a quitter to a top 3 leightweight fighter OAT. He showed me that losing doesn't matter, it's what you do after you lose that matters"
    },
    'Cade': {
      image: cadeImg,
      description: "Even though the playoffs didn't go as planned, we were right there. I am born and raised in Michigan, but wasn't  alive for the bad boys pistons, and since I've been watching basketball, the pistons have been possibly the worst team. I'm hopefuly we have a good offseason and come back better next season."
    }
  };

  const handleCompanyHover = (company: string | null) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    if (company) {
      // Any hover-in cancels the pending unlock (layout-shift grace period)
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
      // Locked to a different company — ignore (layout-shift artifact)
      if (activeCompanyRef.current !== null && activeCompanyRef.current !== company) return;

      hoverTimerRef.current = setTimeout(() => {
        activeCompanyRef.current = company;
        setHoverState({ company, personal: null, sports: null, author: false, aiPictures: false });
      }, 1000);
    } else {
      if (activeCompanyRef.current !== null) {
        // Short grace period: if cursor re-enters any span within 150ms it's a layout-shift
        // artifact and the unlock is cancelled. Genuine moves let the timer fire.
        lockTimerRef.current = setTimeout(() => {
          activeCompanyRef.current = null;
          lockTimerRef.current = null;
          setHoverState(prev => ({ ...prev, company: null }));
        }, 150);
      } else {
        clearTimerRef.current = setTimeout(() => {
          setHoverState(prev => ({ ...prev, company: null }));
        }, 0);
      }
    }
  };

  const handleCompanyAreaLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = null;
    activeCompanyRef.current = null;
    setHoverState(prev => ({ ...prev, company: null }));
  };

  const handlePersonalHover = (keyword: string | null) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    // Instant transition for personal items
    if (keyword) {
      setHoverState({ company: null, personal: keyword, sports: null, author: false, aiPictures: false });
    } else {
      setHoverState({ company: null, personal: null, sports: null, author: false, aiPictures: false });
    }
  };

  const handleSportsHover = (keyword: string | null) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    if (keyword) {
      hoverTimerRef.current = setTimeout(() => {
        setHoverState({ company: null, personal: null, sports: keyword, author: false, aiPictures: false });
      }, 1000);
    } else {
      clearTimerRef.current = setTimeout(() => {
        setHoverState(prev => ({ ...prev, sports: null }));
      }, 0);
    }
  };

  const handleAuthorHover = (hovering: boolean) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    if (hovering) {
      hoverTimerRef.current = setTimeout(() => {
        setHoverState({ company: null, personal: null, sports: null, author: true, aiPictures: false });
      }, 1000);
    } else {
      clearTimerRef.current = setTimeout(() => {
        setHoverState(prev => ({ ...prev, author: false }));
      }, 0);
    }
  };

  const handleAiPicturesHover = (hovering: boolean) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }

    if (hovering) {
      hoverTimerRef.current = setTimeout(() => {
        setHoverState({ company: null, personal: null, sports: null, author: false, aiPictures: true });
      }, 1000);
    } else {
      clearTimerRef.current = setTimeout(() => {
        setHoverState(prev => ({ ...prev, aiPictures: false }));
      }, 0);
    }
  };

  const isEldenRing = hoverState.personal === 'Elden Ring';

  return (
    <div className={`relative min-h-screen w-full overflow-hidden flex items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-[#11111f] text-white' : 'bg-white text-black'}`}>
      {/* Storm background in dark mode */}
      {darkMode && <StormBackground />}
      {/* Rain texture in light mode */}
      {!darkMode && <RainBackground />}
      {/* Background overlay when hovering personal items */}
      {hoverState.personal && personalContent[hoverState.personal] && personalContent[hoverState.personal].image && (
        <div className="absolute inset-0 z-0 transition-opacity duration-700">
          <img
            src={personalContent[hoverState.personal].image}
            alt={hoverState.personal}
            className="size-full object-cover"
          />
        </div>
      )}

      <div
        className={`relative z-10 w-full max-w-4xl px-8 pt-4 pb-8 transition-all duration-300 ${(hoverState.company && hoverState.company !== 'Eaton') || hoverState.sports || hoverState.author || hoverState.aiPictures ? 'mr-[420px]' : ''
          } ${isEldenRing ? 'text-white' : ''}`}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-5xl mb-2">Ohm Kumblekere</h1>
            <p className={`text-lg ${isEldenRing ? 'text-gray-200' : darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-700`}>Product · Engineering · Creation · Try hovering or clicking your cursor over underlined words</p>
          </div>
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className={`text-3xl p-2 rounded-full transition-colors duration-300 hover:bg-gray-200/20 ${darkMode ? 'text-yellow-300' : 'text-gray-700'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Experience Section */}
          <section>
            <h2 className="text-2xl mb-3 border-b border-current pb-2">Experience</h2>
            <p className="text-base leading-relaxed" onMouseLeave={handleCompanyAreaLeave}>
              I have worked at multiple startups (
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.company === 'Pivyr' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleCompanyHover('Pivyr')}
                onMouseLeave={() => handleCompanyHover(null)}
                onClick={() => window.open(companyUrls['Pivyr'], '_blank')}
              >
                <strong>Pivyr</strong>
              </span>
              ,{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.company === 'MeaVana' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleCompanyHover('MeaVana')}
                onMouseLeave={() => handleCompanyHover(null)}
              >
                <strong>MeaVana</strong>
              </span>
              ,{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.company === 'Rishfits' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleCompanyHover('Rishfits')}
                onMouseLeave={() => handleCompanyHover(null)}
              >
                <strong>Rishfits</strong>
              </span>
              ,{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.company === 'Soar Bars' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleCompanyHover('Soar Bars')}
                onMouseLeave={() => handleCompanyHover(null)}
                onClick={() => window.open(companyUrls['Soar Bars'], '_blank')}
              >
                <strong>Soar Bars</strong>
              </span>
              , and{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.company === 'Praxigen' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleCompanyHover('Praxigen')}
                onMouseLeave={() => handleCompanyHover(null)}
              >
                <strong>Praxigen</strong>
              </span>
              ) working software, growth, and predominantly product. Learned how to discover, execute, and ship features based on KPIs and user testing. I'm also a tech sales intern @
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.company === 'Eaton' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleCompanyHover('Eaton')}
                onMouseLeave={() => handleCompanyHover(null)}
                onClick={() => window.open(companyUrls['Eaton'], '_blank')}
              >
                <strong>Eaton</strong>
              </span>{' '}
              where I'm leading GTM on a new product line, shipped a new company website, and automating a sales quote form.
            </p>
            <p className="text-base leading-relaxed mt-4">
              I learned most of my technical skills through coursework and projects. I have experience in <strong>DSA, OOP, ML</strong>, computer architecture, and <strong>web systems</strong>. I'm currently enrolled in computer vision, and applied AI-agents for the upcoming semester. 
              <p className="text-base leading-relaxed mt-4"></p>
              <p>I've been working on some projects recently. One is this website, which is a constant work-in-progress. I deployed an exercise form <a href="https://join-formly.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-500 transition-colors"><strong>feedback engine</strong></a> using Google's MediaPipe and LLM integration, and am now scaling. </p>
              <p className="text-base leading-relaxed mt-4"></p>

              <p>I'm in the final stages of shipping a productivity/fitness iOS app named: <strong>Meridian</strong>. Expect more info and alpha launch soon...</p>
              {/* Some of those include an{' '}
              <a
                href="https://github.com/Omnom90?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-colors underline"
              >
                AI research agent
              </a>{' '}
              that finds credible articles for discovering sources that align with papers I wish to write. I've also developed a{' '}
              <a
                href="https://github.com/Omnom90?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-colors underline"
              >
                music recommendation engine
              </a>{' '}
              using the Spotify API and K-means clustering to prioritize certain audio features and find similar music with improved accuracy. */}
            </p>
            <p className="text-base leading-relaxed mt-4">
              I'm a{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.personal === 'content creator' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handlePersonalHover('content creator')}
                onMouseLeave={() => handlePersonalHover(null)}
                onClick={() => {
                  if (isContentCreator) {
                    // Pause current video, advance to next
                    const currentRef = videoRefs[activeVideoIndex]?.current;
                    if (currentRef) {
                      currentRef.pause();
                    }
                    setActiveVideoIndex(prev => (prev + 1) % 3);
                  }
                }}
              >
                <strong>content creator</strong>
              </span>{' '}
              with around <strong>5k followers</strong> and over <strong>4 million views</strong>. I produce videos focused on fitness and music. I want to inspire people to share their talents and motivate them to strive for greatness (hit me up for any brand deals)
  
            </p>
          </section>

          {/* Myself Section */}
          <section>
            <h2 className="text-2xl mb-3 border-b border-current pb-2">Myself</h2>
            <p className="text-base leading-relaxed">
              In my free time, I have beaten the game{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.personal === 'Elden Ring' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handlePersonalHover('Elden Ring')}
                onMouseLeave={() => handlePersonalHover(null)}
              >
                <strong>Elden Ring</strong>
              </span>{' '}
              (<strong>100% completion</strong>), love to workout (powerlifting & bodybuilding comp soon), joined a band recently, mess around with{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.aiPictures ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleAiPicturesHover(true)}
                onMouseLeave={() => handleAiPicturesHover(false)}
              >
                <strong>AI pictures</strong>
              </span>
              , and am an{' '}
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.author ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleAuthorHover(true)}
                onMouseLeave={() => handleAuthorHover(false)}
              >
                <strong>"author"</strong>
              </span>{' '}
              that loves writing about fitness and philosophy.
            </p>
            <p className="text-base leading-relaxed mt-4">
              Also a huge sports fan especially with UFC (
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.sports === 'Charles "Do Bronx" Oliveira' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleSportsHover('Charles "Do Bronx" Oliveira')}
                onMouseLeave={() => handleSportsHover(null)}
              >
                <strong>Charles "Do Bronx" Oliveira</strong>
              </span>
              ) and NBA ball knowledge master (
              <span
                className={`cursor-pointer transition-colors underline relative ${hoverState.sports === 'Cade' ? 'text-red-500 after:absolute after:inset-y-0 after:left-full after:w-[420px] after:content-[\'\']' : 'hover:text-red-500'}`}
                onMouseEnter={() => handleSportsHover('Cade')}
                onMouseLeave={() => handleSportsHover(null)}
              >
                <strong>Cade</strong>
              </span>{' '}
              for MVP).
            </p>
            <p className="text-base leading-relaxed mt-4">
              hmu to chat -  down to do anything and everything - and enjoy the website (try out dark mode for a cool experience)
            </p>
          </section>
        </div>

        {/* Social Links */}
        <div className="mt-6 flex flex-col gap-2">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last Updated: July 17th, 2026</p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Omnom90?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className={`${isEldenRing ? 'text-gray-300 hover:text-white' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            aria-label="GitHub"
          >
            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/ohmkumblekere/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${isEldenRing ? 'text-gray-300 hover:text-white' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            aria-label="LinkedIn"
          >
            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
          <a
            href="https://ohmk.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${isEldenRing ? 'text-gray-300 hover:text-white' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            aria-label="Medium"
          >
            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@musicbyohm"
            target="_blank"
            rel="noopener noreferrer"
            className={`${isEldenRing ? 'text-gray-300 hover:text-white' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            aria-label="TikTok"
          >
            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>
          <a
            href="mailto:ohmkumbl@gmail.com"
            className={`${isEldenRing ? 'text-gray-300 hover:text-white' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            aria-label="Email"
          >
            <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
        </div>
      </div>

      {/* Company Preview Box */}
      {hoverState.company && !noIframeCompanies.has(hoverState.company) && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[400px] h-[500px] bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
          <iframe
            src={companyUrls[hoverState.company]}
            className="size-full"
            title={`${hoverState.company} preview`}
          />
        </div>
      )}

      {/* Screenshot previews for no-iframe companies */}
      {hoverState.company === 'Pivyr' && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[400px] h-[500px] rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
          <img src={pivyrImg} alt="Pivyr" className="size-full object-cover object-top" />
        </div>
      )}
      {hoverState.company === 'Soar Bars' && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
          <img src={soarBarImg} alt="Soar Bars" className="size-full object-cover" />
        </div>
      )}
      {/* Eaton: no screenshot, keep text fallback */}
      {hoverState.company === 'Eaton' && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[220px] bg-white text-black rounded-lg shadow-2xl border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none p-4">
          <p className="text-sm text-gray-600 text-center">Preview not available — left click to visit the site</p>
        </div>
      )}

      {/* Video Preview Boxes (Content Creator) — 3 videos: left, center, right */}
      {isContentCreator && (
        <>
          {/* Left video */}
          <div className="fixed left-6 top-1/2 -translate-y-1/2 w-[280px] bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
            <video
              ref={videoRef0}
              src={contentCreatorVideos[0]}
              muted={activeVideoIndex !== 0}
              playsInline
              onEnded={() => handleVideoEnded(0)}
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Center video */}
          <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[280px] bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
            <video
              ref={videoRef1}
              src={contentCreatorVideos[1]}
              muted={activeVideoIndex !== 1}
              playsInline
              onEnded={() => handleVideoEnded(1)}
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Right video */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 w-[280px] bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
            <video
              ref={videoRef2}
              src={contentCreatorVideos[2]}
              muted={activeVideoIndex !== 2}
              playsInline
              onEnded={() => handleVideoEnded(2)}
              className="w-full h-auto object-cover"
            />
          </div>
        </>
      )}

      {/* Sports Info Box */}
      {hoverState.sports && sportsContent[hoverState.sports] && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[400px] bg-white text-black rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
          <img
            src={sportsContent[hoverState.sports].image}
            alt={hoverState.sports}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <p className="text-sm leading-relaxed">
              {sportsContent[hoverState.sports].description}
            </p>
          </div>
        </div>
      )}

      {/* Author Preview Box */}
      {hoverState.author && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
          <img
            src={authorImg}
            alt="Medium articles"
            className="size-full object-cover"
          />
        </div>
      )}

      {/* AI Pictures Preview Box */}
      {hoverState.aiPictures && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-red-500 transition-all duration-300 z-50 pointer-events-none">
          <img
            src={minecraft}
            alt="AI generated picture"
            className="size-full object-cover"
          />
        </div>
      )}
    </div>
  );
}