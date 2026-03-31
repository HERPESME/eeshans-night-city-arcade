import { useEffect, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

interface CyberpunkCommandPaletteProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SectionId = 'home' | 'about' | 'projects' | 'contact';

const sectionItems: Array<{ id: SectionId; label: string; icon: string; shortcut: string }> = [
  { id: 'home', label: 'PLAY', icon: '▶', shortcut: '1' },
  { id: 'about', label: 'PROFILE', icon: '◆', shortcut: '2' },
  { id: 'projects', label: 'PROJECTS', icon: '※', shortcut: '3' },
  { id: 'contact', label: 'TERMINAL', icon: '◊', shortcut: '4' },
];

const projectQuickLinks = [
  {
    id: 'careerboost-demo',
    label: 'CareerBoostAI Demo',
    icon: '⚡',
    url: 'https://careerboostaiweb.netlify.app/#',
  },
  {
    id: 'quanttrader-code',
    label: 'QuantTrader Source',
    icon: '🤖',
    url: 'https://github.com/HERPESME/QuantTrader_Project.git',
  },
];

const CyberpunkCommandPalette = ({
  activeSection,
  onSectionChange,
  open,
  onOpenChange,
}: CyberpunkCommandPaletteProps) => {
  const sectionLookup = useMemo(() => new Set(sectionItems.map((item) => item.id)), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaCombo = event.metaKey || event.ctrlKey;

      if (isMetaCombo && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
        return;
      }

      if (!open) return;

      if (event.key === 'Escape') {
        onOpenChange(false);
        return;
      }

      if (['1', '2', '3', '4'].includes(event.key)) {
        const target = sectionItems[Number(event.key) - 1];
        if (target) {
          onSectionChange(target.id);
          onOpenChange(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange, open, onSectionChange]);

  const navigateToSection = (sectionId: string) => {
    if (!sectionLookup.has(sectionId as SectionId)) return;
    onSectionChange(sectionId);
    onOpenChange(false);
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="border-b border-cyber-purple bg-cyber-dark px-4 py-3">
        <div className="text-xs text-cyber-green font-pixel tracking-widest">NEURAL QUICK NAVIGATION</div>
      </div>
      <div className="bg-dark-bg text-white font-pixel">
        <CommandInput
          placeholder="Search command..."
          className="font-pixel text-cyber-blue placeholder:text-cyber-purple"
        />
        <CommandList className="max-h-[360px]">
          <CommandEmpty className="text-cyber-pink">No command found in archive.</CommandEmpty>

          <CommandGroup heading="SECTIONS" className="[&_[cmdk-group-heading]]:text-cyber-purple [&_[cmdk-group-heading]]:font-pixel">
            {sectionItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.id}`}
                onSelect={() => navigateToSection(item.id)}
                className="font-pixel text-cyber-blue data-[selected=true]:bg-cyber-purple/20 data-[selected=true]:text-cyber-pink"
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
                <CommandShortcut className="text-cyber-green">{item.shortcut}</CommandShortcut>
                {activeSection === item.id && (
                  <span className="ml-2 text-[10px] text-cyber-green">ACTIVE</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="bg-cyber-purple/40" />

          <CommandGroup heading="PROJECT QUICK LINKS" className="[&_[cmdk-group-heading]]:text-cyber-purple [&_[cmdk-group-heading]]:font-pixel">
            {projectQuickLinks.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => openExternalLink(item.url)}
                className="font-pixel text-cyber-blue data-[selected=true]:bg-cyber-purple/20 data-[selected=true]:text-cyber-pink"
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
                <CommandShortcut className="text-cyber-orange">OPEN</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
};

export default CyberpunkCommandPalette;
