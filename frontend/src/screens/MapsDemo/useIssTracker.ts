import { useEffect, useRef, useState } from 'react';
import { getSocket, type IssPosition, type IssTrack } from '../../lib/socket';

/** A position placed on this browser's clock (`performance.now()`), so the globe can move it smoothly. */
export interface TimedPosition extends IssPosition {
  at: number;
}

const KEEP = 10;

/** Shortest signed difference between two longitudes (crossing the date line). */
export const lngDelta = (from: number, to: number) => ((to - from + 540) % 360) - 180;
export const wrapLng = (lng: number) => ((lng + 540) % 360) - 180;

// Position at browser time `at`, interpolated between the two positions around it.
export function positionAt(list: TimedPosition[], at: number): IssPosition | null {
  if (list.length === 0) return null;
  for (let i = list.length - 1; i > 0; i--) {
    const a = list[i - 1];
    const b = list[i];
    if (a.at <= at) {
      const ratio = Math.min(1.5, (at - a.at) / (b.at - a.at || 1));
      return {
        ...b,
        lat: a.lat + (b.lat - a.lat) * ratio,
        lng: wrapLng(a.lng + lngDelta(a.lng, b.lng) * ratio),
        altKm: a.altKm + (b.altKm - a.altKm) * ratio,
      };
    }
  }
  return list[0];
}

// Subscribes to the ISS stream. Positions go into a ref, read by the globe on every
// animation frame; the latest one also goes into state, for the readout.
export function useIssTracker() {
  const positions = useRef<TimedPosition[]>([]);
  const [latest, setLatest] = useState<IssPosition | null>(null);
  const [track, setTrack] = useState<IssTrack | null>(null);
  const [connected, setConnected] = useState(() => getSocket().connected);

  useEffect(() => {
    const socket = getSocket();
    // Server clock → browser clock. The smallest gap seen is the one with the least network delay.
    let offset = Infinity;

    const onPosition = (position: IssPosition) => {
      offset = Math.min(offset, performance.now() - position.t);
      const list = positions.current;
      list.push({ ...position, at: position.t + offset });
      if (list.length > KEEP) list.shift();
      setLatest(position);
    };
    const subscribe = () => {
      setConnected(true);
      socket.emit('iss:subscribe');
    };
    const onDisconnect = () => setConnected(false);

    socket.on('connect', subscribe);
    socket.on('disconnect', onDisconnect);
    socket.on('iss:track', setTrack);
    socket.on('iss:position', onPosition);
    // Rooms don't survive a reconnect, so 'connect' subscribes again; this covers an open socket.
    if (socket.connected) socket.emit('iss:subscribe');

    return () => {
      socket.emit('iss:unsubscribe');
      socket.off('connect', subscribe);
      socket.off('disconnect', onDisconnect);
      socket.off('iss:track', setTrack);
      socket.off('iss:position', onPosition);
    };
  }, []);

  return { positions, latest, track, connected };
}
