
import { ReactNode, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps {
  children: ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const PixelButton = ({ 
  children, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  variant = 'primary', 
  size = 'md', 
  className,
  disabled = false 
}: PixelButtonProps) => {
  const variants = {
    primary: 'text-white border-cyber-blue bg-cyber-blue/10 hover:bg-cyber-blue/20 hover:border-cyber-blue hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    secondary: 'text-white border-cyber-purple bg-cyber-purple/10 hover:bg-cyber-purple/20 hover:border-cyber-purple hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]',
    accent: 'text-white border-cyber-pink bg-cyber-pink/10 hover:bg-cyber-pink/20 hover:border-cyber-pink hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    success: 'text-white border-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 hover:border-cyber-green hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    warning: 'text-white border-cyber-orange bg-cyber-orange/10 hover:bg-cyber-orange/20 hover:border-cyber-orange hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={cn(
        'pixel-button relative font-pixel uppercase tracking-wider',
        'transition-all duration-300 hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        'backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Button Content with Enhanced Readability */}
      <span className="relative z-10 block">
        <span 
          className="block"
          style={{
            textShadow: '2px 2px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(0,0,0,0.5), 1px -1px 0px rgba(0,0,0,0.5), -1px 1px 0px rgba(0,0,0,0.5)'
          }}
        >
          {children}
        </span>
      </span>
      
      {/* Pixel Corner Decorations with reduced opacity */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-current opacity-40" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-current opacity-40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-current opacity-40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-current opacity-40" />
    </button>
  );
};

export default PixelButton;
