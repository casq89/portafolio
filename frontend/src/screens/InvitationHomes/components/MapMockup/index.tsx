import Window from '../../../../components/Window';
import { invitationHomesScreens } from '../../../../data/invitationHomes';

const pins = [
  { price: '$1,780', top: '22%', left: '14%' },
  { price: '$2,150', top: '16%', left: '58%' },
  { price: '$1,945', top: '42%', left: '38%', selected: true },
  { price: '$2,390', top: '36%', left: '74%' },
  { price: '$1,690', top: '58%', left: '10%' },
  { price: '$2,020', top: '60%', left: '62%' },
];

// Decorative mock of the interactive map search: price pins plus the selected home's card.
function MapMockup() {
  return (
    <div aria-hidden="true">
      <Window title="search · map" meta="6 homes in view" highlighted>
        <div className="relative h-[380px] overflow-hidden bg-raised">
          {/* Streets and parks */}
          <svg className="absolute inset-0 size-full" viewBox="0 0 400 380" preserveAspectRatio="none">
            <rect x="250" y="210" width="110" height="70" rx="14" className="fill-line" />
            <rect x="30" y="250" width="80" height="50" rx="12" className="fill-line" />
            <g className="stroke-edge" strokeWidth="10" fill="none">
              <path d="M-10 120 C 120 100, 220 150, 410 110" />
              <path d="M140 -10 C 150 120, 120 240, 170 390" />
              <path d="M-10 300 C 140 280, 260 320, 410 290" />
            </g>
            <g className="stroke-edge" strokeWidth="4" fill="none">
              <path d="M300 -10 L 280 390" />
              <path d="M-10 210 L 410 190" />
              <path d="M60 -10 L 90 390" />
            </g>
          </svg>

          {/* Search bar */}
          <div className="absolute inset-x-4 top-4 flex items-center gap-2">
            <div className="flex-1 rounded-full border-[1.5px] border-edge-strong bg-surface px-4 py-2 font-mono text-xs text-subtle">
              ⌕ Charlotte, NC
            </div>
            <div className="rounded-full border-[1.5px] border-fg bg-surface px-3 py-2 font-mono text-xs">filters</div>
          </div>

          {/* Price pins */}
          {pins.map((pin) => (
            <span
              key={pin.price}
              className={`absolute rounded-full border-[1.5px] px-2.5 py-1 font-mono text-[0.72rem] font-bold ${
                pin.selected
                  ? 'z-10 scale-110 border-canvas bg-accent text-on-accent shadow-light-sm'
                  : 'border-canvas bg-fg text-canvas'
              }`}
              style={{ top: pin.top, left: pin.left }}
            >
              {pin.price}
            </span>
          ))}

          {/* Selected home card */}
          <div className="absolute inset-x-4 bottom-4 flex gap-3 rounded-xl border-[1.5px] border-fg bg-surface p-2.5 shadow-layer-sm">
            <img
              src={invitationHomesScreens.lease.src}
              alt=""
              className="h-16 w-20 shrink-0 rounded-lg object-cover object-[50%_40%]"
            />
            <div className="min-w-0 text-sm">
              <p className="font-display font-bold">$1,945 / mo</p>
              <p className="font-mono text-xs text-subtle">3 bds · 2 ba · 1,162 sqft</p>
              <p className="mt-1 font-mono text-xs text-accent">available Jan 13</p>
            </div>
            <span className="ml-auto self-start text-accent">♥</span>
          </div>
        </div>
      </Window>
    </div>
  );
}

export default MapMockup;
