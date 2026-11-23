import { useEffect, useRef, useState } from 'react';
import { accents, type Accent } from '../../../../data/accents';
import { loadAccent, saveAccent } from '../../../../lib/accent';

const swatch = 'block rounded-full border-[1.5px] border-canvas';

function AccentPicker() {
  const [current, setCurrent] = useState<Accent>(loadAccent);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const select = (accent: Accent) => {
    saveAccent(accent);
    setCurrent(accent);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Accent color: ${current.label}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border-[1.5px] border-edge-strong px-2.5 py-2.5 text-subtle transition-colors hover:border-accent hover:text-fg"
      >
        <span aria-hidden="true" className={`${swatch} size-4 ring-1 ring-edge-strong`} style={{ backgroundColor: current.color }} />
        <svg aria-hidden="true" viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <ul
          aria-label="Accent colors"
          className="absolute top-full right-0 z-50 mt-2 flex flex-col gap-1 rounded-xl border-[1.5px] border-edge bg-raised p-1.5 shadow-layer-sm"
        >
          {accents.map((accent) => {
            const selected = accent.id === current.id;
            return (
              <li key={accent.id}>
                <button
                  type="button"
                  aria-label={accent.label}
                  aria-pressed={selected}
                  onClick={() => select(accent)}
                  className={`flex cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-edge ${selected ? 'bg-edge' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className={`${swatch} size-5 ${selected ? 'ring-2 ring-fg' : ''}`}
                    style={{ backgroundColor: accent.color }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AccentPicker;
