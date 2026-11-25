// Case study content for the KCRM project at Konecta (screens/Konecta).

import kcrmCover from '../assets/kcrm-cover.webp';
import type { CaseStudy, CaseStudyFeature } from './caseStudy';

export type KonectaFeatureId = 'campaigns' | 'whatsapp' | 'reports';

export const konectaCover = { src: kcrmCover, alt: 'KCRM by Konecta logo over a network of connected nodes' };

export const konecta: CaseStudy = {
  path: '~/projects/kcrm',
  name: 'KCRM',
  client: 'Konecta',
  tagline: 'From full stack developer to development team lead.',
  intro:
    "At Konecta I worked on the campaigns embedded in KCRM, the web CRM its contact-center operation runs on. As a full stack developer I owned features end to end, from the backend and DB2 databases to the frontend and the web solutions around them, while also managing projects from scope to delivery. In a second stage I led the development team, setting priorities, reviewing code and keeping the platform moving.",
  tags: ['php', 'javascript', 'react', 'node', 'db2', 'cron', 'whatsapp'],
  highlights: [
    { label: 'campaigns', value: 'inbound · outbound · chat' },
    { label: 'data', value: 'DB2 reporting' },
    { label: 'operations', value: 'batch · cron · servers' },
  ],
};

export const konectaFeatures: CaseStudyFeature<KonectaFeatureId>[] = [
  {
    id: 'campaigns',
    kicker: '01 · campaigns',
    title: 'Inbound and outbound campaigns',
    body: 'Configurable campaigns for every kind of operation: inbound queues for customers who reach out, and outbound campaigns that reach out to them. Each one with its own flows, forms and business rules, all managed from the same platform.',
    points: [
      'Inbound and outbound campaign setup',
      'Custom forms, flows and rules per campaign',
      'Agent and supervisor screens',
    ],
  },
  {
    id: 'whatsapp',
    kicker: '02 · chat',
    title: 'WhatsApp chat campaigns',
    body: 'Chat campaigns over WhatsApp, so the same operation that handles calls can talk to customers where they already are, with every conversation tracked inside the CRM.',
    points: [
      'WhatsApp as another campaign channel',
      'Conversations linked to the customer record',
      'One place for voice and chat',
    ],
  },
  {
    id: 'reports',
    kicker: '03 · data',
    title: 'Reports on DB2',
    body: "Reports built by querying DB2 databases, turning the operation's raw data into the numbers supervisors and clients rely on to make decisions.",
    points: ['SQL queries against DB2', 'Operational and client-facing reports', 'Exports for the business teams'],
  },
];
