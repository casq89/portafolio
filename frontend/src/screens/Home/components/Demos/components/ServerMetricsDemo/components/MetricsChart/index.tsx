import { useEffect, useRef, type RefObject } from 'react';
import { lanes, type Lane } from '../../lanes';
import type { TimedSample } from '../../useServerMetrics';

interface MetricsChartProps {
  samples: RefObject<TimedSample[]>;
  intervalMs: number;
  /** Draw only while the card is on screen */
  running: boolean;
}

/** Visible time span */
const WINDOW_MS = 30_000;
const LANE_HEIGHT = 64;
const LABEL_SPACE = 20;
const BOTTOM_PAD = 6;
/** Room on the right for the glowing head of each line */
const HEAD_SPACE = 10;
/** Extra delay on top of one interval, so a late sample never leaves the line hanging */
const JITTER_MS = 200;

const GRID = 'rgba(255, 255, 255, 0.05)';
const GRID_STRONG = 'rgba(255, 255, 255, 0.11)';
const DIVIDER = 'rgba(255, 255, 255, 0.08)';
const TEXT = 'rgba(255, 255, 255, 0.45)';

// "Nice" scale tops (1, 2, 5 × 10^n) so the label reads well.
function niceCeil(value: number): number {
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((n) => n * power >= value) ?? 10;
  return step * power;
}

// Value of a series at time `at`, interpolated between the two samples around it.
function valueAt(list: TimedSample[], key: Lane['series'][number]['key'], at: number): number | null {
  for (let i = list.length - 1; i > 0; i--) {
    const b = list[i];
    const a = list[i - 1];
    if (a.at <= at) {
      const va = a[key];
      const vb = b[key];
      if (va === null || vb === null) return null;
      const ratio = Math.min(1, (at - a.at) / (b.at - a.at || 1));
      return va + (vb - va) * ratio;
    }
  }
  return list[0]?.[key] ?? null;
}

// Oscilloscope-style chart: one lane per resource on a black background, with a
// time grid that scrolls along with the data. Drawn on a canvas at 60 fps; the
// data comes in every `intervalMs` and is interpolated in between.
function MetricsChart({ samples, intervalMs, running }: MetricsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Current (animated) top of each following scale */
  const scales = useRef(new Map<Lane['id'], number>());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !running) return;

    const rootStyle = getComputedStyle(document.documentElement);
    // The canvas hands any opaque CSS color back as #rrggbb, so an alpha suffix can be appended.
    const toHex = (value: string) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillStyle = value || '#ffffff';
      return String(ctx.fillStyle);
    };
    const colors = new Map(lanes.map((lane) => [lane.id, toHex(rootStyle.getPropertyValue(lane.colorVar).trim())]));
    const font = `10px ${getComputedStyle(canvas).fontFamily}`;
    const height = LANE_HEIGHT * lanes.length;

    let width = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const now = performance.now() - intervalMs - JITTER_MS;
      const plotWidth = width - HEAD_SPACE;
      const xOf = (at: number) => plotWidth - ((now - at) / WINDOW_MS) * plotWidth;
      const list = samples.current;
      const visible = list.filter((s) => s.at >= now - WINDOW_MS - intervalMs);

      ctx.clearRect(0, 0, width, height);
      ctx.font = font;
      ctx.textBaseline = 'top';

      // Vertical grid, one line per second and a brighter one every 5 s, moving with time.
      for (let second = Math.floor(now / 1000); second * 1000 > now - WINDOW_MS; second--) {
        const x = Math.round(xOf(second * 1000)) + 0.5;
        ctx.strokeStyle = second % 5 === 0 ? GRID_STRONG : GRID;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      lanes.forEach((lane, index) => {
        const top = index * LANE_HEIGHT;
        const color = colors.get(lane.id) ?? '#ffffff';
        const plotTop = top + LABEL_SPACE;
        const plotHeight = LANE_HEIGHT - LABEL_SPACE - BOTTOM_PAD;

        if (index > 0) {
          ctx.strokeStyle = DIVIDER;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(0, top + 0.5);
          ctx.lineTo(width, top + 0.5);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Scale: fixed, or eased towards the visible peak so it never jumps.
        let max = lane.max;
        if (max === undefined) {
          const peak = Math.max(
            ...visible.flatMap((s) => lane.series.map(({ key }) => s[key] ?? 0)),
            lane.minMax ?? 1,
          );
          const target = niceCeil(peak * 1.15);
          const current = scales.current.get(lane.id) ?? target;
          max = current + (target - current) * 0.08;
          scales.current.set(lane.id, max);
        }

        ctx.fillStyle = color;
        ctx.fillText(lane.label, 8, top + 6);
        ctx.fillStyle = TEXT;
        ctx.textAlign = 'right';
        ctx.fillText(lane.format(max), width - 8, top + 6);
        ctx.textAlign = 'left';

        const yOf = (value: number) => plotTop + plotHeight - (Math.min(value, max) / max) * plotHeight;
        const hasData = visible.some((s) => lane.series.every(({ key }) => s[key] !== null));
        if (!hasData) {
          ctx.fillStyle = TEXT;
          ctx.textAlign = 'center';
          ctx.fillText(list.length === 0 ? 'waiting for data…' : 'n/a on this server', width / 2, plotTop + plotHeight / 2 - 5);
          ctx.textAlign = 'left';
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, top, plotWidth, LANE_HEIGHT);
        ctx.clip();

        for (const { key, dashed } of lane.series) {
          const points = visible.filter((s) => s[key] !== null).map((s) => [xOf(s.at), yOf(s[key] ?? 0)] as const);
          if (points.length < 2) continue;

          // Soft fill under the main line
          if (!dashed) {
            const gradient = ctx.createLinearGradient(0, plotTop, 0, plotTop + plotHeight);
            gradient.addColorStop(0, `${color}38`);
            gradient.addColorStop(1, `${color}00`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(points[0][0], plotTop + plotHeight);
            for (const [x, y] of points) ctx.lineTo(x, y);
            ctx.lineTo(points[points.length - 1][0], plotTop + plotHeight);
            ctx.closePath();
            ctx.fill();
          }

          ctx.strokeStyle = dashed ? `${color}99` : color;
          ctx.lineWidth = dashed ? 1.25 : 1.75;
          ctx.lineJoin = 'round';
          ctx.setLineDash(dashed ? [4, 3] : []);
          ctx.shadowColor = color;
          ctx.shadowBlur = dashed ? 0 : 8;
          ctx.beginPath();
          points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // Glowing head where each main line meets "now"
        const head = valueAt(visible, lane.series[0].key, now);
        if (head !== null) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(plotWidth, yOf(head), 2.75, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [samples, intervalMs, running]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Live chart of the server's CPU, network, open TCP connections and event loop lag"
      className="block w-full font-mono"
      style={{ height: LANE_HEIGHT * lanes.length }}
    />
  );
}

export default MetricsChart;
