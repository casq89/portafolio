// Shared shape of the project case-study screens (screens/Konecta, screens/InvitationHomes…).

export interface CaseStudy {
  /** Terminal-style path shown above the title, e.g. `~/projects/kcrm`. */
  path: string;
  name: string;
  /** Shown after the name in the title, e.g. "KCRM · Konecta". */
  client?: string;
  /** Consultancy the work was done through, shown as "via <name>". */
  via?: string;
  tagline: string;
  intro: string;
  tags: string[];
  highlights: { label: string; value: string }[];
  /** Optional external link, e.g. the app's store page. */
  link?: { label: string; url: string };
}

export interface Screenshot {
  src: string;
  alt: string;
}

export interface CaseStudyFeature<Id extends string = string> {
  id: Id;
  kicker: string;
  title: string;
  body: string;
  points: string[];
}
