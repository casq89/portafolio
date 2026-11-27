import type { Server } from 'socket.io';
import { degreesLat, degreesLong, eciToGeodetic, gstime, propagate, twoline2satrec, type SatRec } from 'satellite.js';

// ISS tracker demo: the server downloads the ISS orbital elements (a TLE from
// CelesTrak), computes the whole UTC day of positions with the SGP4 model and
// streams the current position every second to the browsers in the "iss" room.
// The browser interpolates between positions, so the station moves smoothly.

/** [time in ms, latitude, longitude, altitude in km] */
export type IssPoint = [number, number, number, number];

export interface IssPosition {
  t: number;
  lat: number;
  lng: number;
  altKm: number;
  speedKmh: number;
}

export interface IssTrack {
  /** Orbit around now (past and upcoming), for drawing the path */
  points: IssPoint[];
  /** When the orbital elements were measured (ms) */
  epoch: number;
  intervalMs: number;
}

export interface IssEvents {
  'iss:track': (track: IssTrack) => void;
  'iss:position': (position: IssPosition) => void;
}

export interface IssClientEvents {
  'iss:subscribe': () => void;
  'iss:unsubscribe': () => void;
}

const ROOM = 'iss';
const TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';
/** CelesTrak updates a few times a day and asks clients not to download more often than every 2 h */
const TLE_REFRESH_MS = 6 * 60 * 60 * 1000;
const TLE_RETRY_MS = 10 * 60 * 1000;
const POSITION_INTERVAL_MS = 1000;
/** Step of the precomputed day: 8640 points */
const DAY_STEP_MS = 10 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Track sent to the browser: the last half hour and the next 1.5 orbits */
const TRACK_PAST_MS = 30 * 60 * 1000;
const TRACK_FUTURE_MS = 140 * 60 * 1000;
const TRACK_STEP_MS = 30 * 1000;
const TRACK_REFRESH_MS = 5 * 60 * 1000;
const EARTH_RADIUS_KM = 6371;

const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;

function positionAt(satrec: SatRec, t: number): IssPoint | null {
  const date = new Date(t);
  const state = propagate(satrec, date);
  if (!state) return null;
  const geo = eciToGeodetic(state.position, gstime(date));
  return [t, round(degreesLat(geo.latitude), 4), round(degreesLong(geo.longitude), 4), round(geo.height, 2)];
}

// Every position of the UTC day that contains `t`, one each DAY_STEP_MS.
function computeDay(satrec: SatRec, t: number): IssPoint[] {
  const start = Math.floor(t / DAY_MS) * DAY_MS;
  const points: IssPoint[] = [];
  for (let at = start; at <= start + DAY_MS; at += DAY_STEP_MS) {
    const point = positionAt(satrec, at);
    if (point) points.push(point);
  }
  return points;
}

/** Shortest signed difference between two longitudes, so the date line doesn't break interpolation */
const lngDelta = (from: number, to: number) => ((to - from + 540) % 360) - 180;
const wrapLng = (lng: number) => ((lng + 540) % 360) - 180;

// Great-circle distance between two points at the given radius, in km.
function distanceKm(a: IssPoint, b: IssPoint): number {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = lngDelta(a[2], b[2]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * (EARTH_RADIUS_KM + (a[3] + b[3]) / 2) * Math.asin(Math.min(1, Math.sqrt(h)));
}

async function fetchTle(): Promise<SatRec> {
  const response = await fetch(TLE_URL, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`CelesTrak answered ${response.status}`);
  const lines = (await response.text()).split('\n').map((line) => line.trim());
  const line1 = lines.find((line) => line.startsWith('1 '));
  const line2 = lines.find((line) => line.startsWith('2 '));
  if (!line1 || !line2) throw new Error('No TLE in the CelesTrak answer');
  return twoline2satrec(line1, line2);
}

// satrec.jdsatepoch is a Julian date: days since noon, 1 January 4713 BC.
const epochMs = (satrec: SatRec) => (satrec.jdsatepoch - 2440587.5) * DAY_MS;

export function createIssDemo(io: Server<IssClientEvents, IssEvents>): void {
  let satrec: SatRec | null = null;
  let day: IssPoint[] = [];

  const ensureDay = (t: number) => {
    if (!satrec) return;
    const first = day[0];
    if (!first || t < first[0] || t > day[day.length - 1][0]) day = computeDay(satrec, t);
  };

  // Position at `t`, interpolated from the precomputed day.
  function interpolate(t: number): IssPosition | null {
    ensureDay(t);
    const index = Math.floor((t - (day[0]?.[0] ?? 0)) / DAY_STEP_MS);
    const a = day[index];
    const b = day[index + 1];
    if (!a || !b) return null;
    const ratio = (t - a[0]) / (b[0] - a[0]);
    return {
      t,
      lat: round(a[1] + (b[1] - a[1]) * ratio, 4),
      lng: round(wrapLng(a[2] + lngDelta(a[2], b[2]) * ratio), 4),
      altKm: round(a[3] + (b[3] - a[3]) * ratio, 1),
      speedKmh: Math.round((distanceKm(a, b) / (b[0] - a[0])) * 3_600_000),
    };
  }

  function track(): IssTrack | null {
    if (!satrec) return null;
    const now = Date.now();
    const points: IssPoint[] = [];
    for (let at = now - TRACK_PAST_MS; at <= now + TRACK_FUTURE_MS; at += TRACK_STEP_MS) {
      const position = interpolate(at);
      if (position) points.push([at, position.lat, position.lng, position.altKm]);
    }
    return { points, epoch: Math.round(epochMs(satrec)), intervalMs: POSITION_INTERVAL_MS };
  }

  const listeners = () => io.sockets.adapter.rooms.get(ROOM)?.size ?? 0;

  async function refreshTle(): Promise<void> {
    try {
      satrec = await fetchTle();
      day = computeDay(satrec, Date.now());
      const next = track();
      if (next && listeners() > 0) io.to(ROOM).emit('iss:track', next);
      setTimeout(() => void refreshTle(), TLE_REFRESH_MS).unref();
    } catch (err) {
      console.error('ISS TLE error:', err instanceof Error ? err.message : err);
      setTimeout(() => void refreshTle(), TLE_RETRY_MS).unref();
    }
  }
  void refreshTle();

  setInterval(() => {
    if (listeners() === 0) return;
    const position = interpolate(Date.now());
    if (position) io.to(ROOM).emit('iss:position', position);
  }, POSITION_INTERVAL_MS).unref();

  setInterval(() => {
    const next = track();
    if (next && listeners() > 0) io.to(ROOM).emit('iss:track', next);
  }, TRACK_REFRESH_MS).unref();

  io.on('connection', (socket) => {
    socket.on('iss:subscribe', () => {
      void socket.join(ROOM);
      const current = track();
      if (current) socket.emit('iss:track', current);
    });
    socket.on('iss:unsubscribe', () => {
      void socket.leave(ROOM);
    });
  });
}
