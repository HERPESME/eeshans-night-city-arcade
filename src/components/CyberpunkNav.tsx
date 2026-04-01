import { useState } from 'react';
import PixelButton from './PixelButton';
import GlitchText from './GlitchText';

interface CyberpunkNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const CyberpunkNav = ({ activeSection, onSectionChange }: CyberpunkNavProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'PLAY', icon: '▶' },
    { id: 'about', label: 'PROFILE', icon: '◆' },
    { id: 'projects', label: 'PROJECTS', icon: '※' },
    { id: 'contact', label: 'TERMINAL', icon: '◊' }
  ];

  const handleMobileNav = (id: string) => {
    onSectionChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-bg/90 backdrop-blur-sm border-b border-cyber-purple">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-cyber-pink pixel-perfect" style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }} />
            <GlitchText className="text-lg text-cyber-pink">
              EESHAN.EXE
            </GlitchText>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <PixelButton
                key={item.id}
                variant={activeSection === item.id ? 'accent' : 'primary'}
                size="sm"
                onClick={() => onSectionChange(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative"
              >
                <span className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {hoveredItem === item.id && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green animate-ping" />
                )}
              </PixelButton>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <PixelButton variant="primary" size="sm" onClick={() => setMobileMenuOpen((v) => !v)}>
              ≡
            </PixelButton>
          </div>
        </div>
        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 mt-4 bg-dark-bg border-2 border-cyber-purple rounded-lg shadow-lg z-50 flex flex-col items-stretch px-4 py-2 space-y-2 pixel-perfect">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`text-left px-4 py-3 font-pixel text-lg border-b border-cyber-purple last:border-b-0 flex items-center space-x-2 ${activeSection === item.id ? 'text-cyber-pink' : 'text-cyber-blue'}`}
                onClick={() => handleMobileNav(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default CyberpunkNav;
