import { accents, defaultAccent, type Accent } from '../data/accents';

const storageKey = 'accent';

export function loadAccent(): Accent {
  try {
    const id = localStorage.getItem(storageKey);
    return accents.find((accent) => accent.id === id) ?? defaultAccent;
  } catch {
    return defaultAccent;
  }
}

export function applyAccent(accent: Accent): void {
  const root = document.documentElement.style;
  root.setProperty('--color-accent', accent.color);
  root.setProperty('--color-on-accent', accent.onColor);
}

export function saveAccent(accent: Accent): void {
  applyAccent(accent);
  try {
    localStorage.setItem(storageKey, accent.id);
  } catch {
    // Storage unavailable (private mode): the choice just won't persist.
  }
}
