export interface Project {
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

export const projects: Project[] = [
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
