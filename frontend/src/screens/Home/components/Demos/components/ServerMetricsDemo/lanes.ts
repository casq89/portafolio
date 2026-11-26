import type { MetricsSample } from '../../../../../../lib/socket';

// The resources drawn by the server metrics chart: one lane each, stacked, sharing the time axis.

export type SeriesKey = 'cpu' | 'tcp' | 'netIn' | 'netOut' | 'lag';

export interface Lane {
  id: 'cpu' | 'net' | 'tcp' | 'lag';
  label: string;
  /** CSS variable with the lane color, defined in `@theme` (index.css) */
  colorVar: string;
  /** Lines in the lane; a dashed one is drawn dimmer */
  series: { key: SeriesKey; dashed?: boolean }[];
  /** Fixed top of the scale. Without it the scale follows the visible values. */
  max?: number;
  /** Lowest top of a following scale, so a quiet server doesn't look busy */
  minMax?: number;
  format: (value: number) => string;
}

export function formatBytes(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B/s`;
  if (bytesPerSecond < 1024 ** 2) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / 1024 ** 2).toFixed(1)} MB/s`;
}

const percent = (value: number) => `${value.toFixed(1)}%`;

export const lanes: Lane[] = [
  { id: 'cpu', label: 'cpu', colorVar: '--color-metric-cpu', series: [{ key: 'cpu' }], max: 100, format: percent },
  {
    id: 'net',
    label: 'network',
    colorVar: '--color-metric-net',
    series: [{ key: 'netIn' }, { key: 'netOut', dashed: true }],
    minMax: 4 * 1024,
    format: formatBytes,
  },
  {
    id: 'tcp',
    label: 'tcp connections',
    colorVar: '--color-metric-tcp',
    series: [{ key: 'tcp' }],
    minMax: 10,
    format: (count) => `${Math.round(count)}`,
  },
  {
    id: 'lag',
    label: 'event loop lag',
    colorVar: '--color-metric-lag',
    series: [{ key: 'lag' }],
    minMax: 10,
    format: (ms) => `${ms.toFixed(1)} ms`,
  },
];

/** Text for the legend: the current value of each lane. */
export function laneValue(lane: Lane, sample: MetricsSample | null): string {
  if (!sample) return '—';
  if (lane.id === 'net') {
    if (sample.netIn === null || sample.netOut === null) return 'n/a';
    return `↓${formatBytes(sample.netIn)} ↑${formatBytes(sample.netOut)}`;
  }
  const value = sample[lane.series[0].key];
  return value === null ? 'n/a' : lane.format(value);
}
