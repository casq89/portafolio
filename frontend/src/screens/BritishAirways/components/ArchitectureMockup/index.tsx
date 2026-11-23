import Window from '../../../../components/Window';

const modules = ['booking', 'manage trip', 'day of travel', 'club & rewards'];

// Generic diagram of a modular app: one shell, one module per area of the journey.
// Intentionally high level: it shows the idea, not the client's real internals.
function ArchitectureMockup() {
  return (
    <div aria-hidden="true">
      <Window title="architecture" meta="modular" highlighted>
        <div className="p-5">
          <div className="relative rounded-lg border-[1.5px] border-accent bg-accent/10 px-4 py-3">
            <p className="font-display font-bold">App shell</p>
            <p className="font-mono text-xs text-subtle">iOS · Android</p>
            <span className="absolute -top-3 right-3 rotate-2 rounded-md border-[1.5px] border-canvas bg-accent px-2 py-px font-mono text-[0.68rem] font-bold text-canvas">
              react native
            </span>
          </div>

          <div className="flex justify-around py-1 font-mono text-subtle">
            {modules.map((module) => (
              <span key={module}>↓</span>
            ))}
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {modules.map((module) => (
              <li key={module} className="rounded-lg border-[1.5px] border-edge-strong bg-raised px-3 py-2.5">
                <p className="font-mono text-sm font-bold">{module}</p>
                <p className="mt-0.5 font-mono text-[0.7rem] text-subtle">module</p>
              </li>
            ))}
          </ul>
        </div>
      </Window>
    </div>
  );
}

export default ArchitectureMockup;
