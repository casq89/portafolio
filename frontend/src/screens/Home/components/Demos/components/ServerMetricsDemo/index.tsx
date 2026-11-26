import { useEffect, useRef, useState } from 'react';
import Window from '../../../../../../components/Window';
import type { MetricsInfo, MetricsSample } from '../../../../../../lib/socket';
import MetricsChart from './components/MetricsChart';
import { laneValue, lanes, type Lane } from './lanes';
import { useServerMetrics } from './useServerMetrics';

const DEFAULT_INTERVAL_MS = 500;

// Static class names, so Tailwind generates them (and the color variables the canvas reads).
const dotClass: Record<Lane['id'], string> = {
  cpu: 'bg-metric-cpu',
  net: 'bg-metric-net',
  tcp: 'bg-metric-tcp',
  lag: 'bg-metric-lag',
};

function statusLabel(connected: boolean, info: MetricsInfo | null, latest: MetricsSample | null): string {
  if (!connected) return '○ connecting…';
  if (!info) return '● live';
  const tcp = latest?.tcp;
  const connections = tcp == null ? '' : ` · ${tcp} tcp connection${tcp === 1 ? '' : 's'}`;
  return `● live · ${info.cores} vCPU${connections}`;
}

// Live chart of the resources of the server behind this portfolio, streamed over Socket.IO.
function ServerMetricsDemo({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const { samples, latest, info, received, connected } = useServerMetrics(onScreen);
  const intervalMs = info?.intervalMs ?? DEFAULT_INTERVAL_MS;

  // Only listen (and draw) while the card is on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '200px' });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      <Window title="demo/02 — socket.io" meta={statusLabel(connected, info, latest)} highlighted>
        <div className="flex flex-col gap-4 p-6">
          <h3 className="font-display text-3xl font-bold">Real time</h3>
          <p className="font-mono text-sm text-muted">
            The server behind this site measures itself every {intervalMs} ms and pushes each reading to your
            browser over a WebSocket. No polling, no reloads.
          </p>

          <div className="overflow-hidden rounded-[10px] border-[1.5px] border-edge bg-black font-mono">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b-[1.5px] border-line px-3.5 py-2.5 text-[0.72rem]">
              {lanes.map((lane) => (
                <li key={lane.id} className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className={`size-2 shrink-0 rounded-full ${dotClass[lane.id]}`} />
                  <span className="text-subtle">{lane.label}</span>
                  <span className="ml-auto truncate text-fg tabular-nums">{laneValue(lane, latest)}</span>
                </li>
              ))}
            </ul>
            <MetricsChart samples={samples} intervalMs={intervalMs} running={onScreen} />
            <div className="flex justify-between gap-3 border-t-[1.5px] border-line px-3.5 py-2 text-[0.7rem] text-subtle">
              <span>
                <span className="text-accent">←</span> metrics:sample × {received}
              </span>
              <span>last 30 s</span>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}

export default ServerMetricsDemo;
