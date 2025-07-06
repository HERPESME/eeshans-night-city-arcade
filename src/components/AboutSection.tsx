import PixelButton from './PixelButton';
import GlitchText from './GlitchText';

const AboutSection = () => {
  const skills = [
    { name: 'C++/Python', level: 40, color: 'bg-cyber-purple' },
    { name: 'React/Next.js', level: 40, color: 'bg-cyber-blue' },
    { name: 'Node.js/Express.js', level: 37, color: 'bg-cyber-green' },
    { name: 'AI/ML', level: 20, color: 'bg-cyber-pink' },
    { name: 'Database', level: 70, color: 'bg-cyber-orange' },
    { name: 'Cloud/DevOps', level: 10, color: 'bg-cyber-purple' }
  ];

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-b from-dark-bg to-cyber-dark relative overflow-hidden">
      {/* Minimal cyberpunk GIF overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: "url('/media/pixel-jeff-clipa-s.gif')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08}} />
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <GlitchText className="text-3xl md:text-5xl text-cyber-pink mb-4">
            PROFILE.EXE
          </GlitchText>
          <div className="text-cyber-blue text-lg">ACCESSING PERSONAL DATA...</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center md:gap-12">
          {/* Left Column - Profile */}
          <div className="space-y-8 w-full max-w-screen-sm mx-auto md:h-full md:flex md:flex-col md:justify-between">
            {/* Profile Card */}
            <div className="pixel-button border-cyber-purple text-white p-8 px-2 md:px-8 relative w-full">
              {/* Profile Avatar */}
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyber-pink to-cyber-blue pixel-perfect relative">
                <div className="absolute inset-2 bg-dark-bg flex items-center justify-center text-4xl">
                  👨‍💻
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4 text-sm">
                <div className="text-center">
                  <GlitchText className="text-xl text-cyber-green mb-2">
                    EESHAN
                  </GlitchText>
                  <div className="text-cyber-blue">Full-Stack Developer</div>
                  <div className="text-cyber-pink">AI/ML Enthusiast</div>
                </div>

                <div className="border-t border-cyber-purple pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CLASS:</span>
                    <span className="text-cyber-green">NETRUNNER</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LEVEL:</span>
                    <span className="text-cyber-blue">SENIOR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SPECIALIZATION:</span>
                    <span className="text-cyber-pink">FULL-STACK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">STATUS:</span>
                    <span className="text-cyber-green animate-pulse">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Glitch Effect */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-cyber-pink animate-ping" />
            </div>

            {/* LeetCode Stats */}
            <div className="pixel-button border-cyber-orange text-white p-6 px-2 md:px-6 relative w-full">
              <GlitchText className="text-lg text-cyber-orange mb-4">
                LEETCODE.STATS
              </GlitchText>
              
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-cyber-dark p-3 border border-gray-600">
                    <div className="text-2xl text-cyber-green font-bold">150+</div>
                    <div className="text-xs text-gray-400">SOLVED</div>
                  </div>
                  <div className="bg-cyber-dark p-3 border border-gray-600">
                    <div className="text-2xl text-cyber-blue font-bold">85%</div>
                    <div className="text-xs text-gray-400">ACCURACY</div>
                  </div>
                  <div className="bg-cyber-dark p-3 border border-gray-600">
                    <div className="text-2xl text-cyber-pink font-bold">1850</div>
                    <div className="text-xs text-gray-400">RATING</div>
                  </div>
                  <div className="bg-cyber-dark p-3 border border-gray-600">
                    <div className="text-2xl text-cyber-orange font-bold">TOP 5%</div>
                    <div className="text-xs text-gray-400">RANK</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyber-green">EASY</span>
                      <span className="text-gray-400">120/150</span>
                    </div>
                    <div className="h-2 bg-cyber-dark border border-gray-600">
                      <div className="h-full bg-cyber-green" style={{ width: '80%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyber-orange">MEDIUM</span>
                      <span className="text-gray-400">85/120</span>
                    </div>
                    <div className="h-2 bg-cyber-dark border border-gray-600">
                      <div className="h-full bg-cyber-orange" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyber-pink">HARD</span>
                      <span className="text-gray-400">45/80</span>
                    </div>
                    <div className="h-2 bg-cyber-dark border border-gray-600">
                      <div className="h-full bg-cyber-pink" style={{ width: '56%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-cyber-orange animate-pulse rounded-full flex items-center justify-center text-xs">
                🏆
              </div>
              
              {/* Additional Badges */}
              <div className="absolute top-10 right-2 space-y-1">
                <div className="w-5 h-5 bg-cyber-green animate-ping opacity-75 pixel-perfect flex items-center justify-center text-xs">
                  ⚡
                </div>
                <div className="w-5 h-5 bg-cyber-blue opacity-80 pixel-perfect flex items-center justify-center text-xs animate-pulse">
                  🧠
                </div>
                <div className="w-5 h-5 bg-cyber-pink opacity-70 pixel-perfect flex items-center justify-center text-xs">
                  🎯
                </div>
              </div>
            </div>
          </div>

          {/* Skills Panel */}
          <div className="space-y-6 w-full max-w-screen-sm mx-auto md:h-full md:flex md:flex-col md:justify-between">
            <div className="pixel-button border-cyber-blue text-cyber-blue p-6 px-2 md:px-6 w-full">
              <GlitchText className="text-xl mb-4">SKILL MATRIX</GlitchText>
              
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white">{skill.name}</span>
                      <span className="text-cyber-green">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-cyber-dark border border-gray-600">
                      <div 
                        className={`h-full ${skill.color} transition-all duration-1000 ease-out`}
                        style={{ 
                          width: `${skill.level}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio Text */}
            <div className="pixel-button border-cyber-green text-white p-6 px-2 md:px-6 w-full">
              <GlitchText className="text-lg text-cyber-green mb-4">
                ABOUT.TXT
              </GlitchText>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  Passionate full-stack developer with 5+ years of experience crafting 
                  digital solutions in the cyber realm. Specialized in React, Node.js, 
                  and cutting-edge AI/ML technologies.
                </p>
                <p>
                  When I'm not coding, you'll find me exploring the latest in artificial 
                  intelligence, contributing to open-source projects, or diving deep into 
                  the neural networks of tomorrow.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <PixelButton variant="accent" size="md">
                DOWNLOAD CV
              </PixelButton>
              <PixelButton variant="success" size="md">
                CONTACT
              </PixelButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
