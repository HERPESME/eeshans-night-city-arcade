
import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const GlitchText = ({ children, className, intensity = 'medium' }: GlitchTextProps) => {
  const [glitchLetters, setGlitchLetters] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (typeof children !== 'string') return;
    
    const triggerGlitch = () => {
      const text = children as string;
      const numLetters = Math.floor(Math.random() * 3) + 1; // 1-3 letters
      const positions = new Set<number>();
      
      // Select random positions
      for (let i = 0; i < numLetters; i++) {
        const pos = Math.floor(Math.random() * text.length);
        positions.add(pos);
      }
      
      setGlitchLetters(positions);
      
      // Clear glitch after animation
      setTimeout(() => {
        setGlitchLetters(new Set());
      }, 300);
    };
    
    // Trigger glitch effect periodically
    const interval = setInterval(triggerGlitch, 2000 + Math.random() * 3000); // 2-5 seconds
    
    return () => clearInterval(interval);
  }, [children]);

  const renderGlitchText = () => {
    if (typeof children !== 'string') return children;
    
    return (children as string).split('').map((char, index) => (
      <span
        key={index}
        className={cn(
          'relative inline-block',
          glitchLetters.has(index) && 'animate-glitch-letter'
        )}
        style={{
          textShadow: glitchLetters.has(index) 
            ? '2px 0 #ff0080, -2px 0 #00ffff' 
            : undefined
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    <span 
      className={cn(
        'glitch-text relative inline-block',
        // Reduced glow for better readability
        intensity === 'low' && 'text-shadow-sm',
        intensity === 'medium' && 'text-shadow-md',
        intensity === 'high' && 'text-shadow-lg',
        className
      )}
    >
      {renderGlitchText()}
    </span>
  );
};

export default GlitchText;
