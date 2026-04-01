import { useEffect, useRef, useState } from 'react';
import PixelButton from './PixelButton';
import GlitchText from './GlitchText';
import { sendContactMessage } from '@/lib/contact';

type ContactStatus = {
  type: 'success' | 'error';
  text: string;
};

type Achievement = {
  id: string;
  title: string;
  command: string;
  reward: string;
};

const ACHIEVEMENTS_STORAGE_KEY = 'night-city-achievements';

const TERMINAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'moon_promise', title: 'MOON PROMISE', command: 'unlock.david()', reward: 'Unlocked Edgerunner memory shard.' },
  { id: 'retro_reboot', title: 'RETRO REBOOT', command: 'theme.retro()', reward: 'Enabled retro-mode uplink protocol.' },
  { id: 'blackwall_relic', title: 'BLACKWALL RELIC', command: 'summon.relic()', reward: 'Recovered encrypted relic fragment.' },
  { id: 'ghost_signal', title: 'GHOST SIGNAL', command: 'trace.ghost()', reward: 'Detected hidden Night City transmission.' },
  { id: 'afterlife_oath', title: 'AFTERLIFE OATH', command: 'afterlife.toast()', reward: 'Gained street cred in the Afterlife netrunner circle.' },
  { id: 'sandevistan_sync', title: 'SANDEVISTAN SYNC', command: 'sandevistan.sync()', reward: 'Neural reflexes overclocked for rapid command execution.' },
];

const ACHIEVEMENT_COMMANDS = new Set(TERMINAL_ACHIEVEMENTS.map((item) => item.command));

const TERMINAL_EASTER_EGG_LINES: Record<string, string[]> = {
  'afterlife.toast()': [
    'Connecting to Afterlife private node...',
    'Johnny Silverhand: "To legends that never flatline."',
  ],
  'sandevistan.sync()': [
    'Injecting Sandevistan firmware patch...',
    'Time dilation engaged. Perception running at 200%.',
  ],
};

const ContactSection = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState<ContactStatus | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const contacts = [
    { 
      name: 'GITHUB', 
      handle: 'HERPESME',
      command: 'github.connect()',
      icon: '⚡',
      color: 'text-cyber-green',
      url: 'https://github.com/HERPESME'
    },
    { 
      name: 'LINKEDIN', 
      handle: 'eeshan-singh-pokharia-926790285',
      command: 'linkedin.connect()',
      icon: '🔗',
      color: 'text-cyber-blue',
      url: 'https://www.linkedin.com/in/eeshan-singh-pokharia-926790285'
    },
    { 
      name: 'EMAIL', 
      handle: 'eeshan.singh53@gmail.com',
      command: 'email.send()',
      icon: '📧',
      color: 'text-cyber-pink',
      url: 'mailto:eeshan.singh53@gmail.com'
    },
    { 
      name: 'LEETCODE', 
      handle: 'EeshanSingh',
      command: 'leetcode.connect()',
      icon: '🧩',
      color: 'text-cyber-orange',
      url: 'https://leetcode.com/u/EeshanSingh/'
    }
  ];

  const availableCommands = [...contacts.map((c) => c.command), 'message.send()', 'achievements.show()', 'clear', 'help'];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setUnlockedAchievements(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to restore achievements:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockedAchievements));
    } catch (error) {
      console.error('Failed to persist achievements:', error);
    }
  }, [unlockedAchievements]);

  const appendToTerminal = (lines: string[]) => {
    setTerminalHistory((prev) => [...prev, ...lines]);
  };

  const unlockAchievement = (command: string) => {
    const achievement = TERMINAL_ACHIEVEMENTS.find((item) => item.command === command);
    if (!achievement) return null;

    const alreadyUnlocked = unlockedAchievements.includes(achievement.id);

    if (!alreadyUnlocked) {
      setUnlockedAchievements((prev) => [...prev, achievement.id]);
    }

    return {
      achievement,
      alreadyUnlocked,
    };
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory, isTyping]);

  const executeCommand = (command: string, handle: string, url?: string) => {
    setIsTyping(true);
    appendToTerminal([
      `> ${command}`,
      `Connecting to ${handle}...`,
      'Connection established!'
    ]);
    
    // Open the URL if provided
    if (url) {
      window.open(url, '_blank');
    }
    
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSendingMessage) return;

    const payload = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      subject: contactForm.subject.trim(),
      message: contactForm.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setContactStatus({
        type: 'error',
        text: 'All fields are required before transmission.',
      });
      appendToTerminal([
        '> message.send()',
        'Payload validation failed.',
        'Fill all required fields and retransmit.',
      ]);
      return;
    }

    setIsSendingMessage(true);
    setContactStatus(null);
    appendToTerminal([
      '> message.send()',
      'Encrypting payload...',
      'Routing to transmission gateway...'
    ]);

    const result = await sendContactMessage(payload);

    if (result.ok) {
      appendToTerminal([
        'Transmission successful.',
        'Message delivered to inbox.',
      ]);
      setContactStatus({
        type: 'success',
        text: result.message || 'Message transmitted successfully.',
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } else {
      appendToTerminal([
        'Transmission failed.',
        `Error: ${result.error || 'Unknown gateway failure.'}`,
      ]);
      setContactStatus({
        type: 'error',
        text: result.error || 'Failed to transmit message.',
      });
    }

    setIsSendingMessage(false);
  };

  const handleTerminalInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isTyping) return;
    const input = terminalInput.trim();
    if (!input) return;
    setTerminalInput('');
    setIsTyping(true);

    const matchedContact = contacts.find(c => c.command === input);

    if (matchedContact) {
      appendToTerminal([
        `> ${input}`,
        `Connecting to ${matchedContact.handle}...`,
        'Connection established!'
      ]);
      setTimeout(() => {
        if (matchedContact.url) {
          window.open(matchedContact.url, '_blank');
        }
        setIsTyping(false);
      }, 1200);
    } else if (input === 'achievements.show()') {
      const unlockedCount = unlockedAchievements.length;
      appendToTerminal([
        '> achievements.show()',
        `Unlocked ${unlockedCount}/${TERMINAL_ACHIEVEMENTS.length} achievements.`,
        ...TERMINAL_ACHIEVEMENTS.map((item) => {
          const unlocked = unlockedAchievements.includes(item.id);
          return `${unlocked ? '[UNLOCKED]' : '[LOCKED]'} ${item.title}`;
        }),
      ]);
      setIsTyping(false);
    } else if (input === 'clear') {
      setTerminalHistory([]);
      setIsTyping(false);
    } else if (ACHIEVEMENT_COMMANDS.has(input)) {
      const unlockedResult = unlockAchievement(input);
      if (unlockedResult) {
        const easterEggLines = TERMINAL_EASTER_EGG_LINES[input] || [];
        appendToTerminal([
          `> ${input}`,
          ...easterEggLines,
          unlockedResult.alreadyUnlocked ? 'Achievement already unlocked.' : `Achievement unlocked: ${unlockedResult.achievement.title}`,
          unlockedResult.achievement.reward,
        ]);
      }
      setIsTyping(false);
    } else if (input === 'message.send()') {
      appendToTerminal([
        '> message.send()',
        'Use QUICK.MESSAGE panel to submit secure payload.',
      ]);
      setContactStatus(null);
      setIsTyping(false);
    } else if (input === 'help') {
      appendToTerminal([
        'Available commands:',
        ...availableCommands
      ]);
      setIsTyping(false);
    } else {
      appendToTerminal([
        `> ${input}`,
        'connecting...',
        "Command not recognized. Type 'help' for available commands."
      ]);
      setIsTyping(false);
    }
  };

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-b from-dark-bg to-cyber-dark relative overflow-hidden">
      {/* Minimal cyberpunk GIF overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: "url('/media/pixel-jeff-clipa-s.gif')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08}} />
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <GlitchText className="text-3xl md:text-5xl text-cyber-orange mb-4">
            CONTACT.TERMINAL
          </GlitchText>
          <div className="text-cyber-blue text-lg">ESTABLISHING CONNECTION...</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Terminal Interface */}
            <div className="pixel-button border-cyber-green p-6 bg-black/50 flex flex-col lg:min-h-[42rem]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyber-green">
                <GlitchText className="text-cyber-green">
                  NEURAL_INTERFACE_v2.77
                </GlitchText>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-cyber-orange rounded-full" />
                  <div className="w-3 h-3 bg-cyber-pink rounded-full" />
                </div>
              </div>

              {/* Terminal Output */}
              <div className="flex-1 min-h-[12rem] overflow-y-auto font-mono text-sm mb-4" ref={terminalRef}>
                <div className="text-cyber-green mb-2">
                  Welcome to Eeshan's Neural Interface
                </div>
                <div className="text-gray-400 mb-4">
                  Type 'help' for available commands
                </div>
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-line text-cyber-blue mb-1">{line}</div>
                ))}
                <form onSubmit={handleTerminalInput} className="flex items-center text-cyber-green mt-2">
                  <span className="mr-2">root@nightcity:~$</span>
                  <input
                    type="text"
                    className="bg-transparent border-none outline-none text-cyber-green font-mono w-full"
                    value={terminalInput}
                    onChange={e => setTerminalInput(e.target.value)}
                    disabled={isTyping}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    style={{caretColor: '#00FF41'}}
                  />
                  <span className="terminal-cursor-block ml-1">&nbsp;</span>
                </form>
              </div>

              {/* Terminal Commands */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-3">AVAILABLE COMMANDS:</div>
                {contacts.map((contact) => (
                  <button
                    key={contact.name}
                    onClick={() => executeCommand(contact.command, contact.handle, contact.url)}
                    className="block w-full text-left text-sm font-mono text-cyber-blue hover:text-cyber-pink transition-colors"
                    disabled={isTyping}
                  >
                    {contact.command}
                  </button>
                ))}
                <button
                  onClick={() => {
                    appendToTerminal([
                      '> achievements.show()',
                      `Unlocked ${unlockedAchievements.length}/${TERMINAL_ACHIEVEMENTS.length} achievements.`,
                    ]);
                  }}
                  className="block w-full text-left text-sm font-mono text-cyber-purple hover:text-cyber-pink transition-colors"
                  disabled={isTyping}
                >
                  achievements.show()
                </button>
              </div>
            </div>

            <div className="pixel-button border-cyber-green text-white p-6">
              <GlitchText className="text-lg text-cyber-green mb-4">
                ACHIEVEMENTS.LOG
              </GlitchText>

              <div className="text-xs text-gray-400 mb-3">
                UNLOCKED: {unlockedAchievements.length}/{TERMINAL_ACHIEVEMENTS.length}
              </div>

              <div className="space-y-2">
                {TERMINAL_ACHIEVEMENTS.map((item) => {
                  const unlocked = unlockedAchievements.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`border px-3 py-2 text-xs ${
                        unlocked
                          ? 'border-cyber-green text-cyber-green bg-cyber-green/10'
                          : 'border-gray-600 text-gray-400 bg-cyber-dark/40'
                      }`}
                    >
                      <div className="font-bold">{item.title}</div>
                      <div className="text-[11px] opacity-80 mt-1">{unlocked ? item.reward : 'Hidden command required...'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="pixel-button border-cyber-purple text-white p-6">
              <GlitchText className="text-xl text-cyber-purple mb-6">
                CONNECT.PROTOCOLS
              </GlitchText>
              
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div 
                    key={contact.name}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-600 hover:border-current transition-colors group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{contact.icon}</span>
                      <div>
                        <div className={`font-bold ${contact.color}`}>
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-400 break-all truncate max-w-[12rem]">
                          {contact.handle}
                        </div>
                      </div>
                    </div>
                    <PixelButton 
                      variant="primary" 
                      size="sm"
                      className="w-32"
                      onClick={() => executeCommand(contact.command, contact.handle, contact.url)}
                    >
                      CONNECT
                    </PixelButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Panel */}
            <div className="pixel-button border-cyber-blue text-white p-6">
              <GlitchText className="text-lg text-cyber-blue mb-4">
                STATUS.MONITOR
              </GlitchText>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">AVAILABILITY:</span>
                  <span className="text-cyber-green animate-pulse">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RESPONSE TIME:</span>
                  <span className="text-cyber-blue">~24 HOURS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TIMEZONE:</span>
                  <span className="text-cyber-pink">UTC+5:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">COLLABORATION:</span>
                  <span className="text-cyber-orange">OPEN</span>
                </div>
              </div>
            </div>

            {/* Quick Message */}
            <div className="pixel-button border-cyber-pink text-white p-6">
              <GlitchText className="text-lg text-cyber-pink mb-4">
                QUICK.MESSAGE
              </GlitchText>
              
              <form className="space-y-3" onSubmit={handleMessageSubmit}>
                <input 
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-cyber-dark border border-gray-600 p-3 text-sm font-mono text-white placeholder-gray-500 focus:border-cyber-pink focus:outline-none"
                />
                <input 
                  type="email"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-cyber-dark border border-gray-600 p-3 text-sm font-mono text-white placeholder-gray-500 focus:border-cyber-pink focus:outline-none"
                />
                <input 
                  type="text"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-cyber-dark border border-gray-600 p-3 text-sm font-mono text-white placeholder-gray-500 focus:border-cyber-pink focus:outline-none"
                />
                <textarea
                  placeholder="Enter your message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full bg-cyber-dark border border-gray-600 p-3 text-sm font-mono text-white placeholder-gray-500 focus:border-cyber-pink focus:outline-none resize-none"
                />
                <input 
                  type="hidden"
                  value="message.send()"
                  aria-hidden="true"
                />
                <PixelButton variant="accent" className="w-full" disabled={isSendingMessage}>
                  {isSendingMessage ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
                </PixelButton>

                {contactStatus && (
                  <div
                    className={`text-xs text-center ${
                      contactStatus.type === 'success' ? 'text-cyber-green' : 'text-red-400'
                    }`}
                  >
                    {contactStatus.text}
                  </div>
                )}

                <div className="text-xs text-gray-400 text-center">
                  * Messages are transmitted through secure serverless gateway
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
