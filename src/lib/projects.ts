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
  imageWidth?: number;
  imageHeight?: number;
  architecture: string[];
  keyChallenges: string[];
  impact: string;
}

export const projects: Project[] = [
  {
    "id": 1,
    "title": "ClearFrame",
    "type": "AI/ML",
    "status": "ACTIVE",
    "description": "AI-assisted rights-clearance for film and TV: detect potential third-party IP in footage, research rights holders, and prepare reviewable clearance dossiers.",
    "tech": [
      "Gemini",
      "Parallel API",
      "Google Cloud",
      "React",
      "Firebase"
    ],
    "color": "border-cyber-blue",
    "codeUrl": "https://github.com/HERPESME/clearframe",
    "image": "/media/pngtree-arcade-retro-cyberpunk-generate-ai-image_15729768.webp",
    "imageWidth": 800,
    "imageHeight": 450,
    "architecture": [
      "Video analysis and cited rights-holder research",
      "Deterministic risk scoring and human review",
      "Clearance dossiers, editing markers and music cue sheets"
    ],
    "keyChallenges": [
      "Corroborating detected identities before research",
      "Keeping automated findings reviewable",
      "Separating model observations from clearance decisions"
    ],
    "impact": "Brings detection, research and human review into one clearance workflow.",
    "websiteUrl": "https://clearframe-q5k3kjzu4a-uc.a.run.app"
  },
  {
    "id": 2,
    "title": "UltraFit360",
    "type": "FULL-STACK",
    "status": "ACTIVE",
    "description": "Free AI fitness app for smart calorie and macro tracking, structured workout programs with automatic PR detection, and weekly AI coaching reports.",
    "tech": [
      "AI Coach",
      "Meal Photo Logging",
      "PR Tracking",
      "Apple Health Sync",
      "Health Connect",
      "Recovery Analytics"
    ],
    "color": "border-cyber-green",
    "image": "/media/420982.webp",
    "imageWidth": 800,
    "imageHeight": 450,
    "websiteUrl": "https://ultrafit360.com",
    "architecture": [
      "AI coach chat with weekly multi-agent progress reports",
      "Meal logging via photo, text, and saved food entries",
      "Workout program tracking with auto personal-record detection"
    ],
    "keyChallenges": [
      "Unifying nutrition, training, and recovery into one daily flow",
      "Keeping AI insights personalized across diverse user goals",
      "Balancing depth of analytics with simple, fast user interactions"
    ],
    "impact": "Delivers an all-in-one fitness experience that combines nutrition, workout execution, and adaptive AI coaching in a single app."
  },
  {
    "id": 3,
    "title": "Amanat",
    "type": "AI/ML",
    "status": "RESEARCH",
    "description": "A governed payment research system for AI agents: authorise a spending ceiling, constrain settlement, and retain signed evidence of what was attempted and observed.",
    "tech": [
      "Python",
      "Deterministic Policy",
      "Signed Evidence",
      "Payment Adapters"
    ],
    "color": "border-cyber-pink",
    "codeUrl": "https://github.com/HERPESME/amanat",
    "image": "/media/98ec1f2cfd04d83edeee07f244e062a9.webp",
    "imageWidth": 800,
    "imageHeight": 450,
    "architecture": [
      "Policy checks separate from model decisions",
      "Payment-rail capability registry and adapters",
      "Append-only evidence and recovery workflows"
    ],
    "keyChallenges": [
      "Distinguishing sandbox observations from live guarantees",
      "Handling ambiguous responses and retries",
      "Refusing unsupported payment capabilities"
    ],
    "impact": "Makes agent payment boundaries and their evidence inspectable without treating model text as authorisation."
  },
  {
    "id": 4,
    "title": "QuantTrader",
    "type": "AI/ML",
    "status": "BETA",
    "description": "Deep RL agent for autonomous stock trading with real-time and historical data. Modular, Gym-compatible, and Docker-ready.",
    "tech": [
      "Python",
      "PyTorch",
      "Ray RLlib",
      "OpenAI Gym",
      "Yahoo Finance",
      "Pandas",
      "NumPy"
    ],
    "color": "border-cyber-pink",
    "image": "/media/wp11289734.webp",
    "imageWidth": 800,
    "imageHeight": 495,
    "codeUrl": "https://github.com/HERPESME/QuantTrader_Project.git",
    "architecture": [
      "Gym-compatible environment and market data pipeline",
      "RL training loop with policy optimization",
      "Modular strategy/evaluation components"
    ],
    "keyChallenges": [
      "Avoiding overfitting in non-stationary markets",
      "Reward design for risk-aware behavior",
      "Reproducibility of backtests and evaluations"
    ],
    "impact": "Created an experiment-friendly quant framework for training and evaluating trading agents."
  },
  {
    "id": 5,
    "title": "Manoday",
    "type": "FULL-STACK",
    "status": "DEVELOPMENT",
    "description": "A mental-wellness application combining AI conversations, personal journaling and wellness tracking with a responsive interface.",
    "tech": [
      "React",
      "TypeScript",
      "Firebase",
      "Gemini",
      "Tailwind CSS"
    ],
    "color": "border-cyber-purple",
    "codeUrl": "https://github.com/singh-aryan369/manoday",
    "image": "/media/wp8802100.webp",
    "imageWidth": 800,
    "imageHeight": 450,
    "architecture": [
      "React interface for chat, journals and progress",
      "Firebase authentication, functions and Firestore",
      "AI-assisted conversations and activity recommendations"
    ],
    "keyChallenges": [
      "Making sensitive interactions clear and approachable",
      "Managing session and journal state",
      "Keeping wellbeing tools distinct from clinical care"
    ],
    "impact": "Explores a connected daily wellness experience through conversation, reflection and progress views."
  },
  {
    "id": 6,
    "title": "REAL-TIME MESSENGER",
    "type": "FULL-STACK",
    "status": "ACTIVE",
    "description": "End-to-end encrypted messaging platform",
    "tech": [
      "Socket.io",
      "Express",
      "React",
      "MongoDB"
    ],
    "color": "border-neon-blue",
    "image": "/media/pngtree-arcade-retro-cyberpunk-generate-ai-image_15729770.webp",
    "imageWidth": 720,
    "imageHeight": 404,
    "architecture": [
      "Socket.io real-time transport layer",
      "Express auth and conversation APIs",
      "MongoDB message and user persistence"
    ],
    "keyChallenges": [
      "Reliable delivery and reconnect handling",
      "Room-level access control",
      "Message state synchronization between clients"
    ],
    "impact": "Implemented real-time chat behavior with strong responsiveness and secure communication patterns."
  }
];
