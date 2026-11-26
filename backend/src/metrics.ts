import os from 'os';
import { readFile } from 'fs/promises';
import type { Server } from 'socket.io';

// Server metrics demo: the server samples its own CPU, network, open TCP connections and event
// loop lag every 500 ms and streams them over Socket.IO to the browsers that
// subscribed (the "metrics" room), so the chart on the home page moves live.

export interface MetricsSample {
  /** Server time in ms */
  t: number;
  /** CPU usage across all cores, 0 to 100 */
  cpu: number;
  /** Open TCP connections, IPv4 + IPv6. null where /proc/net/sockstat doesn't exist (not Linux) */
  tcp: number | null;
  /** Bytes per second received, all interfaces but loopback. null where /proc/net/dev doesn't exist (not Linux) */
  netIn: number | null;
  /** Bytes per second sent */
  netOut: number | null;
  /** Worst event loop delay in the interval, in ms */
  lag: number;
}

export interface MetricsInfo {
  cores: number;
  intervalMs: number;
}

export interface MetricsEvents {
  'metrics:snapshot': (snapshot: { info: MetricsInfo; samples: MetricsSample[] }) => void;
  'metrics:sample': (sample: MetricsSample) => void;
}

export interface MetricsClientEvents {
  'metrics:subscribe': () => void;
  'metrics:unsubscribe': () => void;
}

const ROOM = 'metrics';
const INTERVAL_MS = 500;
/** One minute of history, sent to each new subscriber so the chart starts full */
const HISTORY = 120;
/** Period of the timer that measures event loop lag */
const LAG_TICK_MS = 20;

interface CpuTimes {
  idle: number;
  total: number;
}

function readCpuTimes(): CpuTimes {
  let idle = 0;
  let total = 0;
  for (const { times } of os.cpus()) {
    idle += times.idle;
    total += times.user + times.nice + times.sys + times.irq + times.idle;
  }
  return { idle, total };
}

interface NetBytes {
  rx: number;
  tx: number;
}

// Total bytes received and sent by every interface except loopback (Linux only).
async function readNetBytes(): Promise<NetBytes | null> {
  try {
    const text = await readFile('/proc/net/dev', 'utf8');
    let rx = 0;
    let tx = 0;
    // The first two lines are headers: "iface: rx_bytes … (8 rx fields) tx_bytes …"
    for (const line of text.split('\n').slice(2)) {
      const [name, data] = line.split(':');
      if (!data || name.trim() === 'lo') continue;
      const fields = data.trim().split(/\s+/).map(Number);
      rx += fields[0];
      tx += fields[8];
    }
    return { rx, tx };
  } catch {
    return null;
  }
}

// TCP sockets in use ("TCP: inuse N …" and "TCP6: inuse N") across IPv4 and IPv6 (Linux only).
async function readTcpConnections(): Promise<number | null> {
  try {
    const files = await Promise.all([
      readFile('/proc/net/sockstat', 'utf8'),
      readFile('/proc/net/sockstat6', 'utf8').catch(() => ''),
    ]);
    let total = 0;
    for (const match of files.join('\n').matchAll(/^TCP6?: inuse (\d+)/gm)) total += Number(match[1]);
    return total;
  } catch {
    return null;
  }
}

const round = (value: number, decimals = 1) => Math.round(value * 10 ** decimals) / 10 ** decimals;

export function createMetricsDemo(io: Server<MetricsClientEvents, MetricsEvents>): void {
  const info: MetricsInfo = { cores: os.cpus().length, intervalMs: INTERVAL_MS };
  const samples: MetricsSample[] = [];

  // Event loop lag: a short timer that should fire every LAG_TICK_MS. Any extra
  // delay is time the loop was busy; keep the worst one of each interval.
  let maxLag = 0;
  let lastTick = performance.now();
  setInterval(() => {
    const now = performance.now();
    maxLag = Math.max(maxLag, now - lastTick - LAG_TICK_MS);
    lastTick = now;
  }, LAG_TICK_MS).unref();

  let prevCpu = readCpuTimes();
  let prevNet: NetBytes | null = null;
  let prevTime = performance.now();
  void readNetBytes().then((net) => (prevNet = net));

  async function sample(): Promise<void> {
    const [net, tcp] = await Promise.all([readNetBytes(), readTcpConnections()]);
    const cpuTimes = readCpuTimes();
    const now = performance.now();
    const seconds = (now - prevTime) / 1000;

    const idle = cpuTimes.idle - prevCpu.idle;
    const total = cpuTimes.total - prevCpu.total;
    const cpu = total > 0 ? 100 * (1 - idle / total) : 0;

    // Counters can reset (interface restarted): never report a negative rate
    const rate = (current: number, previous: number) => Math.max(0, Math.round((current - previous) / seconds));
    const before = prevNet;
    const hasNet = net !== null && before !== null && seconds > 0;

    const next: MetricsSample = {
      t: Date.now(),
      cpu: round(Math.min(100, Math.max(0, cpu))),
      tcp,
      netIn: hasNet ? rate(net.rx, before.rx) : null,
      netOut: hasNet ? rate(net.tx, before.tx) : null,
      lag: round(Math.max(0, maxLag)),
    };

    prevCpu = cpuTimes;
    prevNet = net;
    prevTime = now;
    maxLag = 0;

    samples.push(next);
    if (samples.length > HISTORY) samples.shift();
    // Sampling is cheap and always on, so a new subscriber gets a full minute; only emit when someone listens.
    if ((io.sockets.adapter.rooms.get(ROOM)?.size ?? 0) > 0) io.to(ROOM).emit('metrics:sample', next);
  }

  setInterval(() => void sample(), INTERVAL_MS).unref();

  io.on('connection', (socket) => {
    socket.on('metrics:subscribe', () => {
      void socket.join(ROOM);
      socket.emit('metrics:snapshot', { info, samples });
    });
    socket.on('metrics:unsubscribe', () => {
      void socket.leave(ROOM);
    });
  });
}
