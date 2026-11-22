// Portfolio content. Text in square brackets is placeholder copy to fill in.

interface NavLink {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  description: string;
  category: string;
  codeUrl: string;
  demoUrl: string;
}

interface Job {
  period: string;
  role: string;
  company: string;
  description: string;
  current: boolean;
}

interface SocialLink {
  name: string;
  url: string;
}

export const navLinks: NavLink[] = [
  { label: 'projects', href: '#projects' },
  { label: 'demos', href: '#demos' },
  { label: 'experience', href: '#experience' },
  { label: 'contact', href: '#contact' },
];

export const projects: Project[] = [
  {
    name: '[Project name]',
    description: '[What problem it solves and what you built.]',
    category: 'frontend',
    codeUrl: '#',
    demoUrl: '#',
  },
  {
    name: '[Project name]',
    description: '[What problem it solves and what you built.]',
    category: 'backend',
    codeUrl: '#',
    demoUrl: '#',
  },
  {
    name: '[Project name]',
    description: '[What problem it solves and what you built.]',
    category: 'full stack',
    codeUrl: '#',
    demoUrl: '#',
  },
];

export const jobs: Job[] = [
  {
    period: '[year] — present',
    role: '[Role]',
    company: '[Company]',
    description: '[What you did and achieved, in one or two lines.]',
    current: true,
  },
  {
    period: '[year] — [year]',
    role: '[Role]',
    company: '[Company]',
    description: '[What you did and achieved, in one or two lines.]',
    current: false,
  },
  {
    period: '[year] — [year]',
    role: '[Role]',
    company: '[Company]',
    description: '[What you did and achieved, in one or two lines.]',
    current: false,
  },
];

export const socialLinks: SocialLink[] = [
  { name: 'GitHub', url: '#' },
  { name: 'LinkedIn', url: '#' },
  { name: 'Email', url: '#' },
];

export const email = '[your-email@domain.com]';
export const cvUrl = '#';
