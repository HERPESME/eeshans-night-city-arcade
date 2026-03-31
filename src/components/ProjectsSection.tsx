import { useMemo, useState } from 'react';
import PixelButton from './PixelButton';
import GlitchText from './GlitchText';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Project {
  id: number;
  title: string;
  type: 'FULL-STACK' | 'AI/ML' | 'WEB3' | 'FRONTEND';
  status: 'ACTIVE' | 'DEPLOYED' | 'BETA' | 'DEVELOPMENT' | 'RESEARCH';
  description: string;
  tech: string[];
  color: string;
  codeUrl?: string;
  demoUrl?: string;
  websiteUrl?: string;
  appUrl?: string;
  image?: string;
  architecture: string[];
  keyChallenges: string[];
  impact: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'CareerBoostAI',
    type: 'FULL-STACK',
    status: 'ACTIVE',
    description: 'AI-powered career platform for resume building, cover letter generation, and interview prep. Modern UI, OpenAI integration, and Supabase backend.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'OpenAI GPT-4', 'Radix UI', 'Vite'],
    color: 'border-cyber-blue',
    codeUrl: 'https://github.com/HERPESME/prompt-career-boost.git',
    demoUrl: 'https://careerboostaiweb.netlify.app/#',
  image: '/media/pngtree-arcade-retro-cyberpunk-generate-ai-image_15729768.jpg',
    architecture: ['React + TypeScript frontend', 'Supabase auth/data layer', 'Prompt orchestration for OpenAI workflows'],
    keyChallenges: ['Reducing latency for AI responses', 'Maintaining resume output quality', 'Balancing UX polish with API usage limits'],
    impact: 'Streamlined resume + interview prep workflows into one AI-assisted platform.',
  },
  {
    id: 2,
    title: 'UltraFit360',
    type: 'FULL-STACK',
    status: 'ACTIVE',
    description: 'Free AI fitness app for smart calorie and macro tracking, structured workout programs with automatic PR detection, and weekly AI coaching reports.',
    tech: ['AI Coach', 'Meal Photo Logging', 'PR Tracking', 'Apple Health Sync', 'Health Connect', 'Recovery Analytics'],
    color: 'border-cyber-green',
  image: '/media/420982.jpg',
    websiteUrl: 'https://ultrafit360.com',
    appUrl: undefined,
    architecture: ['AI coach chat with weekly multi-agent progress reports', 'Meal logging via photo, text, and saved food entries', 'Workout program tracking with auto personal-record detection'],
    keyChallenges: ['Unifying nutrition, training, and recovery into one daily flow', 'Keeping AI insights personalized across diverse user goals', 'Balancing depth of analytics with simple, fast user interactions'],
    impact: 'Delivers an all-in-one fitness experience that combines nutrition, workout execution, and adaptive AI coaching in a single app.',
  },
  {
    id: 3,
    title: 'QuantTrader',
    type: 'AI/ML',
    status: 'BETA',
    description: 'Deep RL agent for autonomous stock trading with real-time and historical data. Modular, Gym-compatible, and Docker-ready.',
    tech: ['Python', 'PyTorch', 'Ray RLlib', 'OpenAI Gym', 'Yahoo Finance', 'Pandas', 'NumPy'],
    color: 'border-cyber-pink',
  image: '/media/wp11289734.jpg',
    codeUrl: 'https://github.com/HERPESME/QuantTrader_Project.git',
    architecture: ['Gym-compatible environment and market data pipeline', 'RL training loop with policy optimization', 'Modular strategy/evaluation components'],
    keyChallenges: ['Avoiding overfitting in non-stationary markets', 'Reward design for risk-aware behavior', 'Reproducibility of backtests and evaluations'],
    impact: 'Created an experiment-friendly quant framework for training and evaluating trading agents.',
  },
  {
    id: 4,
    title: 'BLOCKCHAIN WALLET',
    type: 'WEB3',
    status: 'DEVELOPMENT',
    description: 'Secure cryptocurrency wallet with DeFi integration',
    tech: ['Web3.js', 'Solidity', 'React', 'MetaMask'],
    color: 'border-cyber-orange',
  image: '/media/98ec1f2cfd04d83edeee07f244e062a9.jpg',
    architecture: ['React wallet UI + transaction history', 'MetaMask signing and account access', 'Solidity smart contract interactions'],
    keyChallenges: ['Managing transaction confirmation states', 'Gas-fee-aware UX decisions', 'Safer contract interaction patterns'],
    impact: 'Enabled secure wallet actions and DeFi interaction flows with strong user feedback states.',
  },
  {
    id: 5,
    title: 'ML PREDICTION ENGINE',
    type: 'AI/ML',
    status: 'RESEARCH',
    description: 'Advanced predictive analytics using deep learning',
    tech: ['PyTorch', 'FastAPI', 'Docker', 'Redis'],
    color: 'border-cyber-purple',
  image: '/media/wp8802100.jpg',
    architecture: ['PyTorch model training/inference stack', 'FastAPI serving endpoints', 'Redis caching + Dockerized deployment'],
    keyChallenges: ['Model drift and retraining cadence', 'Low-latency inference under load', 'Feature pipeline consistency'],
    impact: 'Delivered a repeatable ML serving workflow from experiment to containerized API.',
  },
  {
    id: 6,
    title: 'REAL-TIME MESSENGER',
    type: 'FULL-STACK',
    status: 'ACTIVE',
    description: 'End-to-end encrypted messaging platform',
    tech: ['Socket.io', 'Express', 'React', 'MongoDB'],
    color: 'border-neon-blue',
  image: '/media/pngtree-arcade-retro-cyberpunk-generate-ai-image_15729770.jpg',
    architecture: ['Socket.io real-time transport layer', 'Express auth and conversation APIs', 'MongoDB message and user persistence'],
    keyChallenges: ['Reliable delivery and reconnect handling', 'Room-level access control', 'Message state synchronization between clients'],
    impact: 'Implemented real-time chat behavior with strong responsiveness and secure communication patterns.',
  }
];

const ProjectsSection = () => {
  const [selectedType, setSelectedType] = useState<'ALL' | Project['type']>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectProject, setInspectProject] = useState<Project | null>(null);
  const { stats, featuredRepos, loading, error, lastUpdated, refresh } = useGitHubStats();

  const statusColors: Record<Project['status'], string> = {
    'ACTIVE': 'text-cyber-green',
    'DEPLOYED': 'text-cyber-blue',
    'BETA': 'text-cyber-orange',
    'DEVELOPMENT': 'text-cyber-pink',
    'RESEARCH': 'text-cyber-purple'
  };

  const typeFilters = useMemo(() => {
    const uniqueTypes = Array.from(new Set(projects.map((project) => project.type)));
    return ['ALL', ...uniqueTypes] as Array<'ALL' | Project['type']>;
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesType = selectedType === 'ALL' || project.type === selectedType;
      const matchesSearch =
        !normalizedSearch ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch) ||
        project.tech.some((tech) => tech.toLowerCase().includes(normalizedSearch));

      return matchesType && matchesSearch;
    });
  }, [searchTerm, selectedType]);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-b from-cyber-dark to-dark-bg relative overflow-hidden">
      {/* Minimal cyberpunk GIF overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage: "url('/media/pixel-jeff-clipa-s.gif')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08}} />
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <GlitchText className="text-3xl md:text-5xl text-cyber-green mb-4">
            PROJECTS.DATABASE
          </GlitchText>
          <div className="text-cyber-blue text-lg">LOADING PROJECT ARCHIVES...</div>
        </div>

        {/* Search + Filter Console */}
        <div className="pixel-button border-cyber-blue p-6 mb-10 bg-cyber-dark/60 backdrop-blur-sm">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <div className="text-xs text-cyber-purple uppercase tracking-wider mb-2">
                SEARCH ARCHIVE
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, tech, or keyword..."
                className="w-full bg-cyber-dark border-2 border-cyber-purple text-white placeholder-gray-500 px-4 py-3 font-pixel text-xs focus:outline-none focus:border-cyber-pink focus:shadow-[0_0_16px_rgba(236,72,153,0.35)] transition-all"
              />
            </div>

            <div className="text-left lg:text-right">
              <div className="text-xs text-cyber-green uppercase tracking-wider mb-2">
                MATCHED RECORDS
              </div>
              <div className="text-2xl text-cyber-green font-bold">{filteredProjects.length}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs text-cyber-blue uppercase tracking-wider mb-3">FILTER BY CLASS</div>
            <div className="flex flex-wrap gap-3">
              {typeFilters.map((type) => (
                <PixelButton
                  key={type}
                  size="sm"
                  variant={selectedType === type ? 'accent' : 'primary'}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </PixelButton>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id}
              className={`pixel-button ${project.color} p-6 hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Project Image */}
              <div className="w-full h-32 mb-4 bg-gradient-to-br from-cyber-dark to-black border border-gray-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-purple/20 to-cyber-blue/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title + ' screenshot'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      style={{ opacity: 1 }}
                    />
                  ) : (
                    <div className="text-4xl opacity-60">
                      {project.type === 'AI/ML' && '🤖'}
                      {project.type === 'FULL-STACK' && '⚡'}
                      {project.type === 'FRONTEND' && '📊'}
                      {project.type === 'WEB3' && '🔗'}
                    </div>
                  )}
                </div>
                {/* Pixelated overlay effect */}
                <div className="absolute inset-0 opacity-20 pixel-perfect"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${project.color.includes('blue') ? '06B6D4' : project.color.includes('green') ? '10B981' : project.color.includes('pink') ? 'EC4899' : project.color.includes('orange') ? 'F97316' : '8B5CF6'}'%3E%3Cpath d='M0 0h2v2H0V0zm2 2h2v2H2V2z'/%3E%3C/g%3E%3C/svg%3E")`,
                       backgroundSize: '8px 8px'
                     }}
                />
              </div>

              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <GlitchText className="text-lg text-white font-bold">
                    {project.title}
                  </GlitchText>
                  <div className="text-xs text-cyber-blue uppercase">
                    {project.type}
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 border ${statusColors[project.status]} border-current`}>
                  {project.status}
                </div>
              </div>

              {/* Project Description */}
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="space-y-3">
                <div className="text-xs text-cyber-purple uppercase tracking-wider">
                  TECH STACK:
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="text-xs px-2 py-1 bg-cyber-dark border border-gray-600 text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-6">
                <PixelButton
                  variant="warning"
                  size="sm"
                  className="w-full"
                  onClick={() => setInspectProject(project)}
                >
                  INSPECT
                </PixelButton>

                <div className="flex gap-2">
                {project.websiteUrl ? (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <PixelButton variant="success" size="sm" className="w-full">
                      WEBSITE
                    </PixelButton>
                  </a>
                ) : project.codeUrl ? (
                  <a
                    href={project.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <PixelButton variant="primary" size="sm" className="w-full">
                      VIEW CODE
                    </PixelButton>
                  </a>
                ) : (
                  <PixelButton variant="primary" size="sm" className="w-full flex-1" disabled>
                    {project.websiteUrl ? 'WEBSITE' : 'VIEW CODE'}
                  </PixelButton>
                )}

                {project.websiteUrl ? project.appUrl ? (
                  <a
                    href={project.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <PixelButton variant="accent" size="sm" className="w-full">
                      APP
                    </PixelButton>
                  </a>
                ) : (
                  <PixelButton variant="accent" size="sm" className="w-full flex-1" disabled>
                    APP
                  </PixelButton>
                ) : project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <PixelButton variant="accent" size="sm" className="w-full">
                      DEMO
                    </PixelButton>
                  </a>
                ) : (
                  <PixelButton variant="accent" size="sm" className="w-full flex-1" disabled>
                    {project.websiteUrl ? 'APP' : 'DEMO'}
                  </PixelButton>
                )}
                </div>
              </div>

              {/* Hover Effects */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-current animate-ping opacity-0 group-hover:opacity-100" />
              <div className="absolute bottom-2 left-2 w-1 h-4 bg-current opacity-0 group-hover:opacity-60" />
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="pixel-button border-cyber-pink text-cyber-pink p-8 mt-8 text-center">
            <div className="text-lg mb-2">NO ARCHIVE MATCHES</div>
            <div className="text-xs text-gray-300">
              Try a different keyword or switch project class filters.
            </div>
          </div>
        )}

        {/* GitHub Stats */}
        <div className="mt-16 text-center">
          <div className="pixel-button border-cyber-purple text-white p-8 max-w-4xl mx-auto">
            <GlitchText className="text-2xl text-cyber-purple mb-6">
              GITHUB.STATS
            </GlitchText>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="text-xs text-gray-400">
                {lastUpdated ? `Last sync: ${formatLastUpdated(lastUpdated)}` : 'Sync pending...'}
              </div>
              <PixelButton variant="secondary" size="sm" onClick={refresh} disabled={loading}>
                {loading ? 'SYNCING...' : 'REFRESH DATA'}
              </PixelButton>
            </div>

            {error && (
              <div className="text-red-400 text-xs mb-4">⚠ {error}</div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl text-cyber-green font-bold">{loading ? '...' : stats?.totalPublicCommits ?? 0}</div>
                <div className="text-xs text-gray-400">PUBLIC COMMITS</div>
              </div>
              <div>
                <div className="text-2xl text-cyber-blue font-bold">{loading ? '...' : stats?.publicRepos ?? 0}</div>
                <div className="text-xs text-gray-400">REPOS</div>
              </div>
              <div>
                <div className="text-2xl text-cyber-pink font-bold">{loading ? '...' : stats?.languageCount ?? 0}</div>
                <div className="text-xs text-gray-400">LANGUAGES</div>
              </div>
              <div>
                <div className="text-2xl text-cyber-orange font-bold">{loading ? '...' : stats?.totalStars ?? 0}</div>
                <div className="text-xs text-gray-400">STARS</div>
              </div>
            </div>

            <div className="mt-8 border-t border-cyber-purple/40 pt-6 text-left">
              <div className="text-xs text-cyber-green tracking-wider mb-4 uppercase">Featured Repositories</div>

              {featuredRepos.length === 0 ? (
                <div className="text-sm text-gray-400">No repositories available right now.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {featuredRepos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-cyber-blue/40 hover:border-cyber-pink transition-colors p-4 bg-cyber-dark/40"
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="text-cyber-blue font-bold text-sm truncate">{repo.name}</div>
                        <div className="text-xs text-cyber-orange">★ {repo.stars}</div>
                      </div>
                      <div className="text-xs text-gray-300 line-clamp-2 min-h-[2.5rem]">{repo.description}</div>
                      <div className="mt-3 flex justify-between text-[11px] text-gray-400">
                        <span>{repo.language}</span>
                        <span>Forks: {repo.forks}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(inspectProject)} onOpenChange={(open) => !open && setInspectProject(null)}>
        <DialogContent className="border-2 border-cyber-purple bg-dark-bg text-white sm:max-w-3xl max-h-[85vh] overflow-y-auto px-0">
          {inspectProject && (
            <div className="pixel-perfect">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-cyber-purple/40">
                <DialogTitle asChild>
                  <GlitchText className="text-2xl text-cyber-pink">{inspectProject.title}.INSPECT</GlitchText>
                </DialogTitle>
                <DialogDescription className="text-cyber-blue text-xs uppercase tracking-wider">
                  {inspectProject.type} · {inspectProject.status} · Detailed Case Study
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-5 space-y-6">
                <div className="pixel-button border-cyber-blue p-4 bg-cyber-dark/40">
                  <div className="text-xs text-cyber-blue uppercase mb-2 tracking-wider">Overview</div>
                  <p className="text-sm text-gray-200 leading-relaxed">{inspectProject.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="pixel-button border-cyber-green p-4 bg-cyber-dark/40">
                    <div className="text-xs text-cyber-green uppercase mb-3 tracking-wider">Architecture Highlights</div>
                    <ul className="space-y-2 text-sm text-gray-200">
                      {inspectProject.architecture.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-cyber-green">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pixel-button border-cyber-orange p-4 bg-cyber-dark/40">
                    <div className="text-xs text-cyber-orange uppercase mb-3 tracking-wider">Key Challenges</div>
                    <ul className="space-y-2 text-sm text-gray-200">
                      {inspectProject.keyChallenges.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-cyber-orange">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pixel-button border-cyber-pink p-4 bg-cyber-dark/40">
                  <div className="text-xs text-cyber-pink uppercase mb-2 tracking-wider">Impact</div>
                  <p className="text-sm text-gray-200 leading-relaxed">{inspectProject.impact}</p>
                </div>

                <div className="pixel-button border-cyber-purple p-4 bg-cyber-dark/40">
                  <div className="text-xs text-cyber-purple uppercase mb-3 tracking-wider">Tech Stack</div>
                  <div className="flex flex-wrap gap-2">
                    {inspectProject.tech.map((tech, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-black/50 border border-cyber-purple/50 text-gray-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {inspectProject.websiteUrl ? (
                    <a href={inspectProject.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <PixelButton variant="success" className="w-full">OPEN WEBSITE</PixelButton>
                    </a>
                  ) : inspectProject.codeUrl ? (
                    <a href={inspectProject.codeUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <PixelButton variant="primary" className="w-full">OPEN SOURCE</PixelButton>
                    </a>
                  ) : (
                    <PixelButton variant="primary" className="w-full flex-1" disabled>OPEN SOURCE</PixelButton>
                  )}

                  {inspectProject.websiteUrl ? inspectProject.appUrl ? (
                    <a href={inspectProject.appUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <PixelButton variant="accent" className="w-full">OPEN APP</PixelButton>
                    </a>
                  ) : (
                    <PixelButton variant="accent" className="w-full flex-1" disabled>OPEN APP</PixelButton>
                  ) : inspectProject.demoUrl ? (
                    <a href={inspectProject.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <PixelButton variant="accent" className="w-full">OPEN DEMO</PixelButton>
                    </a>
                  ) : (
                    <PixelButton variant="accent" className="w-full flex-1" disabled>OPEN DEMO</PixelButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProjectsSection;
