// Case study content for the British Airways mobile app (screens/BritishAirways).
// Screenshots come from the app's App Store listing.

import booking from '../assets/british-airways/booking.webp';
import cover from '../assets/british-airways/cover.webp';
import dayOfTravel from '../assets/british-airways/day-of-travel.webp';
import liveActivity from '../assets/british-airways/live-activity.webp';
import manage from '../assets/british-airways/manage.webp';
import type { CaseStudy, CaseStudyFeature, Screenshot } from './caseStudy';

export type BritishAirwaysFeatureId = 'architecture' | 'booking' | 'dayOfTravel';

export const britishAirwaysScreens = {
  cover: { src: cover, alt: 'British Airways app: Your journey starts here' },
  booking: { src: booking, alt: 'Flight search screen with origin, destination, dates and travel class' },
  manage: { src: manage, alt: 'Manage booking screen with seats, baggage and passenger details' },
  dayOfTravel: { src: dayOfTravel, alt: 'Day of travel screen with gate status, gate, seat and boarding group' },
  liveActivity: { src: liveActivity, alt: 'Lock screen Live Activity with the flight status' },
} satisfies Record<string, Screenshot>;

export const britishAirways: CaseStudy = {
  path: '~/projects/british-airways',
  name: 'British Airways',
  via: 'Globant',
  tagline: 'From frontend developer to Tech Lead at Globant.',
  intro:
    "At Globant I work on the British Airways app for iOS and Android, used by millions of travellers around the world to book flights, manage their trips, get through the day of travel and track their rewards. It's the most robust project I've been part of, with more than 500 people involved. I started as a frontend developer on its React Native codebase and, in a second stage, stepped up as Tech Lead, leading a development team within the project.",
  tags: ['react-native', 'ios', 'android', 'modular architecture'],
  highlights: [
    { label: 'role', value: 'Frontend developer → Tech Lead' },
    { label: 'scale', value: '500+ people · millions of users' },
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
];

/** Legal note shown at the bottom of the case study. */
export const britishAirwaysDisclaimer =
  'British Airways is a trademark of its respective owner. I worked on this app as part of the Globant team; this portfolio is not affiliated with or endorsed by British Airways. Screenshots are from the publicly released app.';
