import { lazy, Suspense, useCallback, useState } from 'react';
import BackLink from '../../components/BackLink';
import SectionHeader from '../../components/SectionHeader';
import Window from '../../components/Window';
import type { IssPosition, IssTrack } from '../../lib/socket';
import { useIssTracker } from './useIssTracker';

// three.js is heavy: load it only when this screen opens.
const IssGlobe = lazy(() => import('./components/IssGlobe'));

function statusLabel(connected: boolean, track: IssTrack | null): string {
  if (!connected) return '○ connecting…';
  if (!track) return '● live · waiting for orbit data';
  const hours = Math.max(0, Math.round((Date.now() - track.epoch) / 3_600_000));
  return `● live · orbit data ${hours} h old`;
}

const formatCoord = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(3)}° ${value >= 0 ? positive : negative}`;

function readout(position: IssPosition | null): [string, string][] {
  if (!position) return [['iss', 'waiting for the first position…']];
  return [
    ['lat', formatCoord(position.lat, 'N', 'S')],
    ['lng', formatCoord(position.lng, 'E', 'W')],
    ['altitude', `${position.altKm.toFixed(1)} km`],
    ['speed', `${position.speedKmh.toLocaleString('en-US')} km/h`],
  ];
}

function MapsDemo() {
  const { positions, latest, track, connected } = useIssTracker();
  const [follow, setFollow] = useState(true);
  const stopFollowing = useCallback(() => setFollow(false), []);

  return (
    <section className="py-10 md:pb-24">
      <BackLink to="/#demos" path="~/demos" />

      <div className="mt-8">
        <SectionHeader
          path="~/demos/iss"
          title="Where is the ISS?"
          description="The server takes the station's orbital elements, computes its whole day with the SGP4 model and streams its position every second over a WebSocket."
        />
      </div>

      <Window title="demo/03 — sgp4 + three.js" meta={statusLabel(connected, track)} highlighted>
        <div className="p-4 sm:p-6">
          <div className="relative overflow-hidden rounded-[10px] border-[1.5px] border-edge bg-black font-mono">
            <Suspense
              fallback={
                <div className="flex h-[640px] items-center justify-center text-sm text-subtle">loading globe…</div>
              }
            >
              <IssGlobe positions={positions} track={track} follow={follow} onUserMove={stopFollowing} />
            </Suspense>

            <dl className="pointer-events-none absolute top-3 left-3 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 rounded-lg bg-black/60 px-3 py-2 text-xs">
              {readout(latest).map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-subtle">{label}</dt>
                  <dd className="text-fg tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => setFollow((value) => !value)}
              className={`absolute top-3 right-3 cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                follow ? 'border-accent bg-accent text-on-accent' : 'border-edge-strong bg-black/60 text-fg'
              }`}
            >
              {follow ? '◉ following iss' : '○ follow iss'}
            </button>

            <div className="pointer-events-none absolute bottom-3 left-3 flex gap-4 rounded-lg bg-black/60 px-3 py-1.5 text-[0.7rem] text-subtle">
              <span>
                <span className="text-accent">━</span> last 30 min
              </span>
              <span>
                <span className="text-fg">┅</span> next orbit
              </span>
            </div>
          </div>
          <p className="mt-3 font-mono text-xs text-subtle">
            Drag to rotate, scroll to zoom. The station is drawn far larger than life: at true scale it would be
            invisible.
          </p>
        </div>
      </Window>
    </section>
  );
}

export default MapsDemo;
