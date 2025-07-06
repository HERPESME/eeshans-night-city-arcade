import PixelButton from './PixelButton';
import GlitchText from './GlitchText';

interface HomeSectionProps {
  onSectionChange: (section: string) => void;
}

const HomeSection = ({ onSectionChange }: HomeSectionProps) => {
  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/pixel-jeff-clipa-s.gif')`,
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
          <div className="text-center">
            <div className="text-cyber-blue text-lg">50+</div>
            <div className="text-gray-400">PROJECTS</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-lg">5+</div>
            <div className="text-gray-400">YEARS</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-pink text-lg">100%</div>
            <div className="text-gray-400">UPTIME</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-cyber-green animate-ping opacity-60" />
      <div className="absolute bottom-32 right-16 w-3 h-3 bg-cyber-pink animate-pulse opacity-40" />
      <div className="absolute top-1/2 left-8 w-2 h-8 bg-cyber-blue opacity-30" />
    </section>
  );
};

export default HomeSection;
