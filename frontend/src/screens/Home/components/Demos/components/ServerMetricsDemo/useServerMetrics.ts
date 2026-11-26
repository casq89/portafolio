import { useEffect, useRef, useState } from 'react';
import { getSocket, type MetricsInfo, type MetricsSample } from '../../../../../../lib/socket';

/** A sample placed on this browser's clock (`performance.now()`), so the chart can scroll smoothly. */
export interface TimedSample extends MetricsSample {
  at: number;
}

/** Samples older than this are dropped; a bit more than the chart shows. */
const KEEP_MS = 75_000;

// Subscribes to the server metrics stream while `active` (the card is on screen).
// Samples go into a ref, read by the chart on every animation frame; only the
// latest one goes into state, for the legend.
export function useServerMetrics(active: boolean) {
  const samples = useRef<TimedSample[]>([]);
  const [latest, setLatest] = useState<MetricsSample | null>(null);
  const [info, setInfo] = useState<MetricsInfo | null>(null);
  const [received, setReceived] = useState(0);
  const [connected, setConnected] = useState(() => getSocket().connected);

  useEffect(() => {
    const socket = getSocket();
    // Server clock → browser clock. The smallest gap seen is the one with the least network delay.
    let offset = Infinity;

    const place = (sample: MetricsSample): TimedSample => {
      offset = Math.min(offset, performance.now() - sample.t);
      return { ...sample, at: sample.t + offset };
    };

    const onSnapshot = (snapshot: { info: MetricsInfo; samples: MetricsSample[] }) => {
      offset = Infinity;
      const last = snapshot.samples.at(-1);
      if (last) offset = performance.now() - last.t;
      samples.current = snapshot.samples.map(place);
      setInfo(snapshot.info);
      setLatest(last ?? null);
    };

    const onSample = (sample: MetricsSample) => {
      const list = samples.current;
      list.push(place(sample));
      const cutoff = performance.now() - KEEP_MS;
      while (list.length > 0 && list[0].at < cutoff) list.shift();
      setLatest(sample);
      setReceived((count) => count + 1);
    };

    const subscribe = () => {
      setConnected(true);
      if (active) socket.emit('metrics:subscribe');
    };
    const onDisconnect = () => setConnected(false);

    socket.on('connect', subscribe);
    socket.on('disconnect', onDisconnect);
    socket.on('metrics:snapshot', onSnapshot);
    socket.on('metrics:sample', onSample);
    // Rooms don't survive a reconnect, so 'connect' subscribes again; this covers an open socket.
    if (socket.connected && active) socket.emit('metrics:subscribe');

    return () => {
      if (active) socket.emit('metrics:unsubscribe');
      socket.off('connect', subscribe);
      socket.off('disconnect', onDisconnect);
      socket.off('metrics:snapshot', onSnapshot);
      socket.off('metrics:sample', onSample);
    };
  }, [active]);

  return { samples, latest, info, received, connected };
}
