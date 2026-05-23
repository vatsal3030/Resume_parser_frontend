import BrutalistTemplate from './BrutalistTemplate';
import MinimalTemplate from './MinimalTemplate';
import DeveloperTemplate from './DeveloperTemplate';
import CreativeTemplate from './CreativeTemplate';
import EnterpriseTemplate from './EnterpriseTemplate';
import GlassmorphismTemplate from './GlassmorphismTemplate';

export const PORTFOLIO_TEMPLATES = {
  BRUTALIST: {
    id: 'BRUTALIST',
    name: 'Neo-Brutalist',
    component: BrutalistTemplate,
  },
  MINIMAL: {
    id: 'MINIMAL',
    name: 'Minimal Clean',
    component: MinimalTemplate,
  },
  DEVELOPER: {
    id: 'DEVELOPER',
    name: 'Terminal / IDE',
    component: DeveloperTemplate,
  },
  CREATIVE: {
    id: 'CREATIVE',
    name: 'Creative Multi-page',
    component: CreativeTemplate,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise SaaS',
    component: EnterpriseTemplate,
  },
  GLASSMORPHISM: {
    id: 'GLASSMORPHISM',
    name: 'Glassmorphism',
    component: GlassmorphismTemplate,
  }
};
