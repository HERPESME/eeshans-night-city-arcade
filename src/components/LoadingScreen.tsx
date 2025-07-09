import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('LOADING');
  const [crash, setCrash] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFlash(true);
          setTimeout(() => {
            setFlash(false);
            setCrash(true);
            setTimeout(() => {
              setCrash(false);
              onComplete();
            }, 1000);
          }, 120); // Flash duration
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Flicker loading text
    const textInterval = setInterval(() => {
      setLoadingText(prev => prev === 'LOADING' ? 'LOADING...' : 'LOADING');
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-dark-bg flex flex-col items-center justify-center scanlines z-50">
      {/* White/Red Flash */}
      {flash && (
        <div className="absolute inset-0 z-50 bg-white bg-opacity-90 animate-flash" />
      )}
      {/* Crash Effect Overlay */}
      {crash && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95 animate-crash-glitch overflow-hidden">
          {/* Static/Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-30 animate-static-glitch" style={{background: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)'}} />
          <span className="relative text-5xl md:text-7xl font-pixel text-red-600 animate-crash-flicker select-none crash-glitch-text" style={{textShadow: '0 0 16px #fff, 0 0 32px #f00, 2px 0 #0ff, -2px 0 #f0f'}}>
            SYSTEM FAILURE
          </span>
          <span className="relative mt-6 text-lg md:text-2xl font-mono text-gray-200 animate-crash-flicker2 select-none" style={{textShadow: '0 0 8px #f00, 0 0 16px #fff'}}>
            {'>'} TERMINAL CORE DUMPED
          </span>
          <style>{`
            @keyframes crash-glitch {
              0% { filter: none; }
              10% { filter: blur(2px) contrast(2); }
              20% { filter: none; }
              30% { filter: blur(1px) contrast(1.5); }
              40% { filter: none; }
              50% { filter: blur(2px) contrast(2); }
              60% { filter: none; }
              70% { filter: blur(1px) contrast(1.5); }
              80% { filter: none; }
              90% { filter: blur(2px) contrast(2); }
              100% { filter: none; }
            }
            .animate-crash-glitch { animation: crash-glitch 1s linear; }
            @keyframes crash-flicker {
              0%, 100% { opacity: 1; }
              10%, 30%, 50%, 70%, 90% { opacity: 0.5; }
              20%, 40%, 60%, 80% { opacity: 1; }
            }
            .animate-crash-flicker { animation: crash-flicker 1s linear; }
            @keyframes crash-flicker2 {
              0%, 100% { opacity: 1; }
              15%, 35%, 55%, 75%, 95% { opacity: 0.3; }
              25%, 45%, 65%, 85% { opacity: 1; }
            }
            .animate-crash-flicker2 { animation: crash-flicker2 1s linear; }
            @keyframes static-glitch {
              0% { opacity: 0.3; }
              10% { opacity: 0.5; }
              20% { opacity: 0.2; }
              30% { opacity: 0.4; }
              40% { opacity: 0.3; }
              50% { opacity: 0.6; }
              60% { opacity: 0.2; }
              70% { opacity: 0.5; }
              80% { opacity: 0.3; }
              90% { opacity: 0.4; }
              100% { opacity: 0.3; }
            }
            .animate-static-glitch { animation: static-glitch 1s steps(10) infinite; }
            .crash-glitch-text {
              animation: crash-text-shake 1s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes crash-text-shake {
              10%, 90% { transform: translateX(-1px); }
              20%, 80% { transform: translateX(2px); }
              30%, 50%, 70% { transform: translateX(-4px); }
              40%, 60% { transform: translateX(4px); }
              100% { transform: none; }
            }
            .animate-flash { animation: flash 0.12s linear; }
            @keyframes flash {
              0% { opacity: 1; background: #fff; }
              100% { opacity: 0; background: transparent; }
            }
          `}</style>
        </div>
      )}
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B5CF6' fill-opacity='0.1'%3E%3Cpath d='m0 40 40-40v40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Loading Animation */}
      <div className="text-center z-10 space-y-8">
        {/* Pixel Character Walking */}
        <div className="relative h-24 w-full overflow-visible mb-0">
          {/* Walking man GIF moves with loading bar, appears to walk on the loading bar */}
          <img
            src="/media/qaFq+R.gif"
            alt="Walking Man"
            className="absolute"
            style={{
              left: `calc(${progress}% - 3.5rem)`,
              bottom: '-1.2rem',
              height: '5rem',
              width: '5rem',
              zIndex: 2
            }}
          />
        </div>

        {/* Loading Bar */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="pixel-button border-cyber-blue text-cyber-blue p-2 mb-4">
            <div className="text-xs mb-2 text-center">INITIALIZING NIGHT CITY...</div>
            <div className="relative h-4 bg-cyber-dark border border-cyber-blue">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-blue to-cyber-pink transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                {progress}%
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-cyber-pink text-lg neon-glow animate-flicker">
          {loadingText}
        </div>

        {/* System Messages */}
        <div className="text-xs text-cyber-green space-y-1 font-mono">
          <div className={progress > 20 ? 'opacity-100' : 'opacity-0'}>{'> CONNECTING TO MATRIX...'}</div>
          <div className={progress > 40 ? 'opacity-100' : 'opacity-0'}>{'> LOADING NEURAL INTERFACE...'}</div>
          <div className={progress > 60 ? 'opacity-100' : 'opacity-0'}>{'> SYNCING CYBERNETICS...'}</div>
          <div className={progress > 80 ? 'opacity-100' : 'opacity-0'}>{'> WELCOME TO THE GRID...'}</div>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 animate-scanlines pointer-events-none opacity-20">
        <div className="h-1 w-full bg-cyber-green" />
      </div>
    </div>
  );
};

export default LoadingScreen;
