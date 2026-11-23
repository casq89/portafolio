// Portfolio content. Text in square brackets is placeholder copy to fill in.

import kcrmCover from '../assets/kcrm-cover.png';
import { britishAirwaysScreens } from './britishAirways';
import { invitationHomesScreens } from './invitationHomes';

interface NavLink {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  description: string;
  category: string;
  /** Internal route with the project's case study; makes the whole card clickable. */
  route?: string;
  /** Years worked on the project, shown under the title, e.g. "2018 — 2022". */
  period?: string;
  /** Consultancy the work was done through, shown next to the period as "via <name>". */
  via?: string;
  /** `position` is a CSS object-position, to choose which part of the image the card crop shows. */
  image?: { src: string; alt: string; position?: string };
  codeUrl?: string;
  demoUrl?: string;
}

interface SocialLink {
  name: string;
  url: string;
}

export const navLinks: NavLink[] = [
  { label: 'projects', href: '/#projects' },
  { label: 'demos', href: '/#demos' },
  { label: 'contact', href: '/#contact' },
  { label: 'hobbies', href: '/hobbies' },
];

export const projects: Project[] = [
  {
    name: 'KCRM · Konecta',
    description:
      'Web CRM for a contact-center operation: inbound, outbound and WhatsApp campaigns, DB2 reporting and the batch jobs behind it.',
    category: 'full stack',
    route: '/konecta',
    period: '2018 — 2022',
    image: { src: kcrmCover, alt: 'KCRM by Konecta logo over a network of connected nodes' },
  },
  {
    name: 'Invitation Homes',
    description:
      'iOS and Android app to find, tour, rent and live in a home, with an interactive map search built on a native maps SDK. Frontend in React Native.',
    category: 'mobile',
    route: '/invitation-homes',
    period: '2022 — 2024',
    via: '10Pearls',
    image: {
      src: invitationHomesScreens.cover.src,
      alt: 'Invitation Homes app logo',
      position: '50% 8%',
    },
  },
  {
    name: 'British Airways',
    description:
      'The airline’s iOS and Android app: booking, trip management, day of travel and rewards. A large-scale React Native codebase with a modular architecture.',
    category: 'mobile',
    route: '/british-airways',
    period: '2024 — present',
    via: 'Globant',
    image: {
      src: britishAirwaysScreens.cover.src,
      alt: 'British Airways app: Your journey starts here',
      position: '50% 6%',
    },
  },
];

export const socialLinks: SocialLink[] = [
  { name: 'GitHub', url: 'https://github.com/casq89' },
  // TODO: replace with the personal LinkedIn profile URL.
  { name: 'LinkedIn', url: 'https://www.linkedin.com' },
  { name: 'Email', url: 'mailto:casq89@gmail.com' },
];

export const email = 'casq89@gmail.com';

/** Who I am: shown in the Hero and used to build the downloadable CV. */
export const profile = {
  name: 'Camilo Sanchez',
  role: 'Software Engineer',
  summary:
    "I'm Camilo, a software engineer who leads development teams without leaving the code behind. I build web and mobile products with React, React Native and Node.js, designing scalable architectures and applying advanced patterns so they stay maintainable as they grow. Hands on the keyboard, eyes on the big picture.",
};

/** Tech stack, listed in the Hero terminal and in the CV. */
export const skills = [
  'react-native',
  'react',
  'node',
  'nextjs',
  'sql',
  'advanced-js-patterns',
  'frontend-design-patterns',
  'unit-and-integration-tests',
];
