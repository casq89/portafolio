import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { Vector3 } from 'three';
import earthNight from '../../../../assets/maps-demo/earth-night.webp';
import earthTopology from '../../../../assets/maps-demo/earth-topology.webp';
import type { IssPoint, IssTrack } from '../../../../lib/socket';
import { positionAt, type TimedPosition } from '../../useIssTracker';
import { createShipModel } from './shipModel';

interface IssGlobeProps {
  positions: RefObject<TimedPosition[]>;
  track: IssTrack | null;
  follow: boolean;
  /** Called when the visitor drags or zooms, so following stops */
  onUserMove: () => void;
}

const HEIGHT = 640;
const EARTH_RADIUS_KM = 6371;
/** Camera distance while following, in Earth radii above the surface: close enough to see it move */
const FOLLOW_ALTITUDE = 0.9;
/** Extra delay on top of one interval, so a late position never leaves the station stuck */
const JITTER_MS = 250;

interface Path {
  id: 'past' | 'future';
  points: IssPoint[];
}

const ratio = (altKm: number) => altKm / EARTH_RADIUS_KM;

// 3D Earth with the ISS flying over it in real time. The server sends a position
// every second; each animation frame interpolates between the last two, so the
// station glides instead of jumping. Loaded lazily, since three.js is heavy.
function IssGlobe({ positions, track, follow, onUserMove }: IssGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const ship = useMemo(() => createShipModel(0.9), []);
  const [accent] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#ff8a3d',
  );
  const followRef = useRef(follow);
  const onUserMoveRef = useRef(onUserMove);

  useEffect(() => {
    followRef.current = follow;
    onUserMoveRef.current = onUserMove;
  }, [follow, onUserMove]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Split the orbit into the stretch already flown and the one ahead, every few seconds.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const paths = useMemo<Path[]>(() => {
    if (!track) return [];
    const past = track.points.filter((point) => point[0] <= now);
    const future = track.points.filter((point) => point[0] >= now);
    return [
      { id: 'past', points: past },
      { id: 'future', points: future },
    ];
  }, [track, now]);

  // Move (and aim) the station on every frame, and keep the camera on it while following.
  useEffect(() => {
    const globe = globeRef.current;
    if (!ready || !globe) return;
    const intervalMs = track?.intervalMs ?? 1000;
    const up = new Vector3();
    const ahead = new Vector3();
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const at = performance.now() - intervalMs - JITTER_MS;
      const current = positionAt(positions.current, at);
      const next = positionAt(positions.current, at + 1000);
      if (!current || !next) {
        ship.visible = false;
        return;
      }
      ship.visible = true;
      Object.assign(ship.position, globe.getCoords(current.lat, current.lng, ratio(current.altKm)));
      up.copy(ship.position).normalize();
      ship.up.copy(up);
      Object.assign(ahead, globe.getCoords(next.lat, next.lng, ratio(next.altKm)));
      ship.lookAt(ahead);

      if (followRef.current) {
        const { altitude } = globe.pointOfView();
        globe.pointOfView({ lat: current.lat, lng: current.lng, altitude }, 0);
      }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [ready, positions, ship, track?.intervalMs]);

  const onReady = () => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.enableDamping = true;
    controls.addEventListener('start', () => onUserMoveRef.current());
    globe.pointOfView({ altitude: FOLLOW_ALTITUDE });
    setReady(true);
  };

  return (
    <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height: HEIGHT }}>
      {width > 0 && (
        <Globe
          ref={globeRef}
          width={width}
          height={HEIGHT}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={earthNight}
          bumpImageUrl={earthTopology}
          atmosphereColor={accent}
          atmosphereAltitude={0.15}
          onGlobeReady={onReady}
          pathsData={paths}
          pathPoints={(path: object) => (path as Path).points}
          pathPointLat={(point: IssPoint) => point[1]}
          pathPointLng={(point: IssPoint) => point[2]}
          pathPointAlt={(point: IssPoint) => ratio(point[3])}
          pathColor={(path: object) => ((path as Path).id === 'past' ? `${accent}cc` : 'rgba(255, 255, 255, 0.55)')}
          pathStroke={(path: object) => ((path as Path).id === 'past' ? 1.4 : 0.8)}
          pathDashLength={(path: object) => ((path as Path).id === 'past' ? 1 : 0.02)}
          pathDashGap={(path: object) => ((path as Path).id === 'past' ? 0 : 0.012)}
          pathDashAnimateTime={(path: object) => ((path as Path).id === 'past' ? 0 : 60_000)}
          pathTransitionDuration={0}
          customLayerData={[{ id: 'iss' }]}
          customThreeObject={() => ship}
          customThreeObjectUpdate={() => undefined}
        />
      )}
    </div>
  );
}

export default IssGlobe;
