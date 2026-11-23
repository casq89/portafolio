// Case study content for the KCRM project at Konecta (screens/Konecta).

import kcrmCover from '../assets/kcrm-cover.png';
import type { CaseStudy, CaseStudyFeature } from './caseStudy';

export type KonectaFeatureId = 'campaigns' | 'whatsapp' | 'reports' | 'batch';

export const konectaCover = { src: kcrmCover, alt: 'KCRM by Konecta logo over a network of connected nodes' };

export const konecta: CaseStudy = {
  path: '~/projects/kcrm',
  name: 'KCRM',
  client: 'Konecta',
  tagline: 'The CRM behind a contact-center operation.',
  intro:
    "KCRM is the web CRM Konecta's contact-center operation runs on. I worked across the whole platform: the tools to create and run every kind of inbound and outbound campaign, WhatsApp chat campaigns, reporting on top of DB2 databases, and the batch processes and crons that keep the data moving behind the scenes.",
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
  {
    id: 'batch',
    kicker: '04 · automation',
    title: 'Batch processes and crons',
    body: 'Scheduled batch processes and cron jobs for data loads, syncs and report generation, running unattended so the operation starts every day with fresh data.',
    points: ['Nightly data loads and syncs', 'Scheduled report generation', 'Logs to trace every run'],
  },
];
