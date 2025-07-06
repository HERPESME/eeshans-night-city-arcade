import PixelButton from './PixelButton';
import GlitchText from './GlitchText';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { useState, useRef } from 'react';

interface HomeSectionProps {
  onSectionChange: (section: string) => void;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
}

const HomeSection = ({ onSectionChange, pauseBackgroundMusic, resumeBackgroundMusic }: HomeSectionProps) => {
  const [open, setOpen] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [playHover, setPlayHover] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayClick = () => {
    setShowGif(true);
    // Pause background music when video starts
    pauseBackgroundMusic();
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }, 0);
  };

  const handleCloseModal = () => {
    setShowGif(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Resume background music when video ends
    resumeBackgroundMusic();
  };

  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('/media/pixel-jeff-clipa-s.gif')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-dark-bg/70" />
      
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Main Title */}
        <div className="space-y-4">
          <GlitchText className="text-4xl md:text-6xl text-cyber-pink" intensity="high">
            EESHAN
          </GlitchText>
          <div className="text-lg md:text-xl text-cyber-blue neon-glow">
            FULL-STACK DEVELOPER
          </div>
          <div className="text-sm md:text-base text-cyber-green">
            AI/ML ENTHUSIAST
          </div>
        </div>

        {/* Status Bar */}
        <div className="pixel-button border-cyber-purple text-cyber-purple p-4 max-w-md mx-auto">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>STATUS:</span>
              <span className="text-cyber-green">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span>LOCATION:</span>
              <span className="text-cyber-blue">NIGHT CITY</span>
            </div>
            <div className="flex justify-between">
              <span>SKILLS:</span>
              <span className="text-cyber-pink">LEGENDARY</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <PixelButton 
            variant="accent" 
            size="lg"
            onClick={() => onSectionChange('about')}
          >
            <span className="flex items-center space-x-2">
              <span>▶</span>
              <span>START GAME</span>
            </span>
          </PixelButton>
          
          <PixelButton 
            variant="success" 
            size="lg"
            onClick={() => onSectionChange('projects')}
          >
            <span className="flex items-center space-x-2">
              <span>※</span>
              <span>LOAD PROJECTS</span>
            </span>
          </PixelButton>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center space-x-8 text-xs">
          <div className="text-center flex flex-col items-center">
            <div className="text-cyber-blue text-lg">15+</div>
            <div className="text-gray-400">PROJECTS</div>
          </div>
          <div className="text-center flex flex-col items-center relative">
            <div className="text-cyber-green text-lg">2+</div>
            <div className="text-gray-400">YEARS</div>
            {/* Pixelated Oval Green PLAY Button */}
            <button
              className="mt-2 p-0 border-none bg-transparent shadow-none transition duration-200"
              style={{ width: 120, height: 48, background: 'none', cursor: 'pointer' }}
              aria-label="Play Video"
              onClick={handlePlayClick}
              onMouseEnter={() => setPlayHover(true)}
              onMouseLeave={() => setPlayHover(false)}
            >
              <svg width="120" height="48" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="inner-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feFlood flood-color="#1fc16c" result="flood" flood-opacity="0.7"/>
                    <feComposite in="flood" in2="SourceAlpha" operator="in" result="mask"/>
                    <feMorphology in="mask" operator="dilate" radius="2" result="dilated"/>
                    <feGaussianBlur in="dilated" stdDeviation="4" result="blurred"/>
                    <feComposite in="blurred" in2="SourceAlpha" operator="out" result="inner-glow"/>
                    <feComposite in="SourceGraphic" in2="inner-glow" operator="over"/>
                  </filter>
                </defs>
                {/* Outer pixel border */}
                <rect x="2" y="2" width="116" height="44" fill="#009e4f" stroke="#222" strokeWidth="4" rx="18"/>
                {/* Inner highlight with inner glow on hover */}
                <rect x="8" y="8" width="104" height="32" fill="#1fc16c" stroke="#009e4f" strokeWidth="2" rx="14"
                  filter={playHover ? 'url(#inner-glow)' : undefined}/>
                {/* Pixelated corners (simulate with small squares) */}
                <rect x="0" y="0" width="4" height="4" fill="#222" />
                <rect x="116" y="0" width="4" height="4" fill="#222" />
                <rect x="0" y="44" width="4" height="4" fill="#222" />
                <rect x="116" y="44" width="4" height="4" fill="#222" />
                {/* PLAY text */}
                <text x="60" y="32" textAnchor="middle" fontFamily="'Press Start 2P', 'VT323', 'monospace'" fontSize="18" fill="#111" style={{ letterSpacing: 2 }}>
                  PLAY
                </text>
              </svg>
            </button>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="text-cyber-pink text-lg">100%</div>
            <div className="text-gray-400">UPTIME</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-cyber-green animate-ping opacity-60" />
      <div className="absolute bottom-32 right-16 w-3 h-3 bg-cyber-pink animate-pulse opacity-40" />
      <div className="absolute top-1/2 left-8 w-2 h-8 bg-cyber-blue opacity-30" />

      {/* Minimal Custom Modal for GIF */}
      {showGif && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              position: 'relative',
              marginTop: '5vh',
              background: '#1a1a2e',
              border: '4px solid #EC4899',
              boxShadow: '0 0 32px #ec4899cc',
              padding: 0,
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                background: '#EC4899',
                color: '#fff',
                border: 'none',
                width: 32,
                height: 32,
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <img
              src="/media/6fbb634a2a22545d2fe04cd21b3077ba.gif"
              alt="Retro Video"
              style={{
                display: 'block',
                width: 'auto',
                height: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain',
                margin: 0,
              }}
            />
            {/* Hidden audio element for Edgerunner dub */}
            <audio
              ref={audioRef}
              src="/media/Cyberpunk Edgerunners Ep 4 I LL TAKE YOU TO THE MOON I PROMISE Dub.mp3"
              autoPlay
              style={{ display: 'none' }}
              onEnded={handleCloseModal}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeSection;
