// Case study content for the British Airways mobile app (screens/BritishAirways).
// Screenshots come from the app's App Store listing.

import booking from '../assets/british-airways/booking.jpg';
import cover from '../assets/british-airways/cover.jpg';
import dayOfTravel from '../assets/british-airways/day-of-travel.jpg';
import liveActivity from '../assets/british-airways/live-activity.jpg';
import manage from '../assets/british-airways/manage.jpg';
import rewards from '../assets/british-airways/rewards.jpg';
import type { CaseStudy, CaseStudyFeature, Screenshot } from './caseStudy';

export type BritishAirwaysFeatureId = 'architecture' | 'booking' | 'dayOfTravel' | 'rewards';

export const britishAirwaysScreens = {
  cover: { src: cover, alt: 'British Airways app: Your journey starts here' },
  booking: { src: booking, alt: 'Flight search screen with origin, destination, dates and travel class' },
  manage: { src: manage, alt: 'Manage booking screen with seats, baggage and passenger details' },
  dayOfTravel: { src: dayOfTravel, alt: 'Day of travel screen with gate status, gate, seat and boarding group' },
  liveActivity: { src: liveActivity, alt: 'Lock screen Live Activity with the flight status' },
  rewards: { src: rewards, alt: 'British Airways Club membership cards with Avios and tier points' },
} satisfies Record<string, Screenshot>;

export const britishAirways: CaseStudy = {
  path: '~/projects/british-airways',
  name: 'British Airways',
  via: 'Globant',
  tagline: 'The airline in your pocket, from booking to boarding.',
  intro:
    "British Airways' app for iOS and Android, where travellers book flights, manage their trips, get through the day of travel and keep track of their rewards. Working on it through Globant, it's the largest and most complex project I've been part of: a large-scale React Native codebase with a modular architecture built to grow.",
  tags: ['react-native', 'ios', 'android', 'modular architecture'],
  highlights: [
    { label: 'role', value: 'Senior frontend developer' },
    { label: 'architecture', value: 'Modular, at scale' },
    { label: 'app store', value: '4.5 ★ · 278K ratings' },
  ],
  link: { label: 'View on the App Store', url: 'https://apps.apple.com/us/app/british-airways/id284793089' },
};

export const britishAirwaysFeatures: CaseStudyFeature<BritishAirwaysFeatureId>[] = [
  {
    id: 'architecture',
    kicker: '01 · architecture',
    title: 'Built for scale',
    body: 'A large app organized into well-defined modules, each one covering a part of the journey, so the product can keep growing without losing consistency for travellers on iOS and Android.',
    points: ['Modular, scalable architecture', 'Each area of the journey well isolated', 'One consistent experience on iOS and Android'],
  },
  {
    id: 'booking',
    kicker: '02 · booking',
    title: 'Book and manage trips',
    body: 'Search and book flights, then manage everything about the trip from the same place: seats, baggage and passenger details.',
    points: ['Flight search and booking', 'Seats and baggage', 'Passenger details'],
  },
  {
    id: 'dayOfTravel',
    kicker: '03 · on the day',
    title: 'With you on the day of travel',
    body: 'Gate status, seat and boarding group at a glance, plus live flight updates right on the lock screen, so nobody has to dig for information at the airport.',
    points: ['Gate, seat and boarding info', 'Live Activities on the lock screen', 'Real-time flight status'],
  },
  {
    id: 'rewards',
    kicker: '04 · loyalty',
    title: 'Rewards in one place',
    body: 'The British Airways Club membership card, Avios and tier points always at hand inside the app.',
    points: ['Digital membership card', 'Avios and tier points', 'Membership tiers'],
  },
];
