import { useState } from 'react';
import PixelButton from './PixelButton';
import GlitchText from './GlitchText';

const ContactSection = () => {
  const [terminalText, setTerminalText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
      handle: 'eeshan-singh-926790285',
      command: 'linkedin.connect()',
      icon: '🔗',
      color: 'text-cyber-blue',
      url: 'https://www.linkedin.com/in/eeshan-singh-926790285'
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

  const executeCommand = (command: string, handle: string, url?: string) => {
    setIsTyping(true);
    setTerminalText(`> ${command}\nConnecting to ${handle}...\nConnection established!\n`);
    
    // Open the URL if provided
    if (url) {
      window.open(url, '_blank');
    }
    
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
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

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Terminal Interface */}
          <div className="pixel-button border-cyber-green p-6 bg-black/50">
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
            <div className="h-64 overflow-y-auto font-mono text-sm mb-4">
              <div className="text-cyber-green mb-2">
                Welcome to Eeshan's Neural Interface
              </div>
              <div className="text-gray-400 mb-4">
                Type 'help' for available commands
              </div>
              
              {terminalText && (
                <div className="text-cyber-blue whitespace-pre-line mb-2">
                  {terminalText}
                </div>
              )}
              
              <div className="flex items-center text-cyber-green">
                <span className="mr-2">root@nightcity:~$</span>
                <span className="terminal-cursor"></span>
              </div>
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
            </div>
          </div>

          {/* Contact Cards */}
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
              
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Enter your message..."
                  className="w-full bg-cyber-dark border border-gray-600 p-3 text-sm font-mono text-white placeholder-gray-500 focus:border-cyber-pink focus:outline-none"
                />
                <PixelButton variant="accent" className="w-full" disabled>
                  TRANSMIT MESSAGE
                </PixelButton>
                <div className="text-xs text-gray-400 text-center">
                  * Backend integration required for email delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
