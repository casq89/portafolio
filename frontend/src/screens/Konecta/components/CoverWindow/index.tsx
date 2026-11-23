import Window from '../../../../components/Window';
import { konectaCover } from '../../../../data/konecta';

// KCRM cover image framed as a window, for the case-study header.
function CoverWindow() {
  return (
    <>
      <Window title="kcrm-cover.png" meta="konecta" highlighted>
        <img src={konectaCover.src} alt={konectaCover.alt} className="block aspect-[4/3] w-full object-cover" />
      </Window>
      <span className="absolute -right-2 -bottom-4 rotate-3 rounded-lg border-[1.5px] border-canvas bg-accent px-2.5 py-0.5 font-mono text-[0.72rem] font-bold text-canvas">
        full stack
      </span>
    </>
  );
}

export default CoverWindow;
