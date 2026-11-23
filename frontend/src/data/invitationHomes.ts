// Case study content for the Invitation Homes mobile app (screens/InvitationHomes).
// Screenshots come from the app's App Store listing.

import checklist from '../assets/invitation-homes/checklist.jpg';
import cover from '../assets/invitation-homes/cover.jpg';
import lease from '../assets/invitation-homes/lease.jpg';
import payments from '../assets/invitation-homes/payments.jpg';
import search from '../assets/invitation-homes/search.jpg';
import tour from '../assets/invitation-homes/tour.jpg';
import type { CaseStudy, CaseStudyFeature, Screenshot } from './caseStudy';

export type InvitationHomesFeatureId = 'map' | 'tours' | 'residents' | 'architecture';

export const invitationHomesScreens = {
  cover: { src: cover, alt: 'Invitation Homes app: Rent smart. Get more.' },
  search: { src: search, alt: 'Saved homes screen with favorites and a 360° tour badge' },
  tour: { src: tour, alt: 'Home detail screen with a 3D tour player' },
  checklist: { src: checklist, alt: 'Move-in checklist with tasks before, during and after the move' },
  payments: { src: payments, alt: 'My Home screen with balance due, last payment and autopay' },
  lease: { src: lease, alt: 'Lease details screen with the lease period' },
} satisfies Record<string, Screenshot>;

export const invitationHomes: CaseStudy = {
  path: '~/projects/invitation-homes',
  name: 'Invitation Homes',
  via: '10Pearls',
  tagline: 'Find, tour, rent and live in a home, all from one app.',
  intro:
    "Invitation Homes is a U.S. single-family home rental company, and this is its app for iOS and Android. Through 10Pearls, I was part of the team that built it, focused on the frontend: the React Native app that takes people from an interactive map search to touring a home, moving in, and paying rent once they live there.",
  tags: ['react-native', 'ios', 'android', 'maps', 'node', 'aws lambda', 'terraform'],
  highlights: [
    { label: 'role', value: 'Senior frontend developer' },
    { label: 'platforms', value: 'iOS · Android' },
    { label: 'app store', value: '4.9 ★ rating' },
  ],
  link: { label: 'View on the App Store', url: 'https://apps.apple.com/us/app/invitation-homes/id1613172655' },
};

export const invitationHomesFeatures: CaseStudyFeature<InvitationHomesFeatureId>[] = [
  {
    id: 'map',
    kicker: '01 · search',
    title: 'Interactive map search',
    body: 'A native maps SDK used for the home search: every available home shows up as a price pin on an interactive map that stays in sync with the list. Move the map, tap a pin or filter by price, size and features, and the results follow.',
    points: ['Native maps SDK with price pins', 'Map and list kept in sync', 'Filters by price, size and features'],
  },
  {
    id: 'tours',
    kicker: '02 · homes',
    title: 'Listings, favorites and tours',
    body: 'Rich home listings with photos and details, saved favorites and searches, and tours either way: a 3D virtual tour from the couch or an in-person visit scheduled from the app.',
    points: ['Favorites and saved searches', '3D virtual tours', 'In-person tour scheduling'],
  },
  {
    id: 'residents',
    kicker: '03 · residents',
    title: 'Move-in and resident experience',
    body: 'Once the lease is signed, the app keeps working for the resident: a guided move-in checklist, rent payments in a few steps with autopay, billing history and lease details always at hand.',
    points: ['Move-in checklist', 'Rent payments and autopay', 'Billing history and lease details'],
  },
  {
    id: 'architecture',
    kicker: '04 · architecture',
    title: 'Built to scale',
    body: 'One React Native codebase for iOS and Android, organized with advanced design patterns so features can grow without turning into a tangle. Behind it, a Node.js backend running on AWS Lambda with infrastructure defined in Terraform. My focus was the app, working closely with that stack.',
    points: [
      'One codebase for iOS and Android',
      'Advanced design patterns in React Native',
      'Node.js on AWS Lambda, infrastructure in Terraform',
    ],
  },
];
