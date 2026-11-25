// Portfolio content. Text in square brackets is placeholder copy to fill in.

import kcrmCover from '../assets/kcrm-cover.webp';
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
  /** Experience entry for the downloadable CV, written in CV style (no first person). */
  cv?: { title: string; points: string[] };
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
      'Full stack developer on the CRM behind a contact-center operation: backend, frontend and DB2, managing projects end to end and later leading the development team.',
    category: 'full stack',
    route: '/konecta',
    cv: {
      title: 'Full stack developer / Team lead',
      points: [
        "Developed inbound, outbound and WhatsApp chat campaigns embedded in KCRM, the web CRM behind Konecta's contact-center operation.",
        'Built features end to end across backend, frontend and web solutions, with DB2 as the database engine.',
        'Managed projects from scope to delivery.',
        'Led the development team in a second stage: setting priorities, reviewing code and keeping the platform moving.',
      ],
    },
    period: '2018 — 2022',
    image: { src: kcrmCover, alt: 'KCRM by Konecta logo over a network of connected nodes' },
  },
  {
    name: 'Invitation Homes',
    description:
      'Full stack developer at 10Pearls on a home rental app for iOS and Android: React Native on the front, Node.js on AWS Lambda behind it and infrastructure in Terraform.',
    category: 'mobile',
    route: '/invitation-homes',
    cv: {
      title: 'Full stack web developer',
      points: [
        'Built the Invitation Homes app for iOS and Android with React Native, from interactive map search and home tours to move-in and rent payments.',
        'Developed the Node.js services behind it, running on AWS Lambda.',
        'Defined and maintained the infrastructure as code with Terraform.',
      ],
    },
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
      'Frontend developer turned Tech Lead at Globant on the airline’s React Native app, used by millions worldwide, in a project of more than 500 people.',
    category: 'mobile',
    route: '/british-airways',
    cv: {
      title: 'Frontend developer / Tech Lead',
      points: [
        'Working on the British Airways app for iOS and Android, used by millions of travellers worldwide, in a project of more than 500 people.',
        'Developed features in a large-scale React Native codebase: booking, trip management and day of travel.',
        'Promoted to Tech Lead in a second stage, leading a development team within the project.',
      ],
    },
    period: '2024 — present',
    via: 'Globant',
    image: {
      src: britishAirwaysScreens.cover.src,
      alt: 'British Airways app: Your journey starts here',
      position: '50% 6%',
    },
  },
];

export const email = 'contacto@casq89.com';

export const socialLinks: SocialLink[] = [
  { name: 'GitHub', url: 'https://github.com/casq89' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/camilo-sanchez-155709402/' },
  { name: 'Email', url: `mailto:${email}` },
];

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
