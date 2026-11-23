export interface Accent {
  id: string;
  /** Accessible name; the picker only shows the color swatch. */
  label: string;
  color: string;
  /** Text color used on top of the accent background. */
  onColor: string;
}

const dark = '#0c0c0e';
const light = '#ededf0';

export const accents: Accent[] = [
  { id: 'orange', label: 'Orange', color: '#ff8a3d', onColor: dark },
  { id: 'silver', label: 'Silver', color: '#c9c9c9', onColor: dark },
  { id: 'lime', label: 'Lime', color: '#81ff6b', onColor: dark },
  { id: 'blue', label: 'Blue', color: '#004dd1', onColor: light },
  { id: 'violet', label: 'Violet', color: '#7454ff', onColor: light },
];

export const defaultAccent = accents[0];
