import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import CyberpunkNav from '@/components/CyberpunkNav';
import CyberpunkCommandPalette from '@/components/CyberpunkCommandPalette';
import HomeSection from '@/components/HomeSection';
import AboutSection from '@/components/AboutSection';
import ProjectsSection from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';

interface IndexProps {
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
}

const QUICK_ACCESS_HINT_KEY = 'nightcityarcade.quick-access-hint.seen';

const Index = ({ pauseBackgroundMusic, resumeBackgroundMusic }: IndexProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showQuickAccessHint, setShowQuickAccessHint] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl + K');

  useEffect(() => {
    // Add scanlines effect to body
    document.body.classList.add('scanlines');
    
    return () => {
      document.body.classList.remove('scanlines');
    };
  }, []);

  useEffect(() => {
    const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(window.navigator.platform);
    setShortcutLabel(isAppleDevice ? '⌘ + K' : 'Ctrl + K');

    try {
      const hintSeen = window.localStorage.getItem(QUICK_ACCESS_HINT_KEY) === '1';

      if (!hintSeen) {
        setShowQuickAccessHint(true);
        window.localStorage.setItem(QUICK_ACCESS_HINT_KEY, '1');

        const timeoutId = window.setTimeout(() => {
          setShowQuickAccessHint(false);
        }, 7000);

        return () => window.clearTimeout(timeoutId);
      }
    } catch {
      setShowQuickAccessHint(true);
    }

    return undefined;
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection 
          onSectionChange={setActiveSection} 
          pauseBackgroundMusic={pauseBackgroundMusic}
          resumeBackgroundMusic={resumeBackgroundMusic}
        />;
      case 'about':
        return <AboutSection onSectionChange={setActiveSection} />;
      case 'projects':
        return <ProjectsSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <HomeSection 
          onSectionChange={setActiveSection} 
          pauseBackgroundMusic={pauseBackgroundMusic}
          resumeBackgroundMusic={resumeBackgroundMusic}
        />;
    }
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white font-pixel pixel-perfect">
      <CyberpunkNav 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />

      <CyberpunkCommandPalette
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
      />

      {showQuickAccessHint && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs border-2 border-cyber-purple bg-dark-bg/95 px-4 py-3 text-xs md:text-sm text-cyber-blue shadow-[0_0_24px_rgba(139,92,246,0.35)] pixel-perfect">
          <div className="flex items-start gap-3">
            <span className="text-cyber-pink">⌨</span>
            <div className="flex-1">
              <p className="text-cyber-pink">Quick Access</p>
              <p className="mt-1 text-cyber-blue/90">Press {shortcutLabel} to open command navigation.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickAccessHint(false)}
              className="text-cyber-green hover:text-cyber-pink transition-colors"
              aria-label="Dismiss quick access hint"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <main className="pt-16">
        {renderActiveSection()}
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.1'%3E%3Cpath d='m0 40 40-40v40h-40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyber-pink animate-ping opacity-30" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyber-blue animate-pulse opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyber-green animate-bounce opacity-20" />
      </div>
    </div>
  );
};

export default Index;
