
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('LOADING');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
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
        <div className="relative h-16 w-full overflow-hidden mb-8">
          <div 
            className="absolute top-0 h-16 w-16 bg-cyber-pink pixel-perfect animate-pixel-walk"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              animationDuration: '3s'
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
