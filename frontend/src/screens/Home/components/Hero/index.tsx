function Hero() {
  return (
    <section
      id="home"
      className="flex scroll-mt-8 flex-wrap items-center gap-14 py-8"
    >
      <div className="min-w-0 flex-[1_1_400px]">
        <p className="mb-6 inline-block rounded-full border-[1.5px] border-accent px-3.5 py-1.5 font-mono text-xs text-accent">
          ● available for projects
        </p>
        <p className="mt-6 max-w-[480px] text-lg text-muted font-mono">
          I'm Camilo, a software engineer who leads development teams without
          leaving the code behind. I build web and mobile products with React,
          React Native and Node.js, designing scalable architectures and
          applying advanced patterns so they stay maintainable as they grow.
          Hands on the keyboard, eyes on the big picture.
          {/* Decorative blinking cursor; stays still for users who prefer reduced motion. */}
          <span aria-hidden="true" className="ml-1 text-accent motion-safe:animate-blink">
            ▍
          </span>
        </p>
        <div className="mt-9 flex flex-wrap gap-3.5">
          <a
            href="#projects"
            className="rounded-[10px] border-[1.5px] border-accent bg-accent px-[22px] py-3 font-semibold text-canvas shadow-light-sm transition-transform hover:-translate-y-0.5"
          >
            See projects
          </a>
          <a
            href="#demos"
            className="rounded-[10px] border-[1.5px] border-fg bg-surface px-[22px] py-3 font-semibold shadow-layer-sm transition-transform hover:-translate-y-0.5"
          >
            Try the demos
          </a>
        </div>
      </div>

      <StackedWindows />
    </section>
  );
}

const stack = ['react-native', 'react', 'node', 'nextjs', 'sql'];

// Decorative composition: browser, terminal and socket notification layered on top of each other.
function StackedWindows() {
  return (
    <div
      aria-hidden="true"
      className="relative h-[470px] min-w-0 flex-[1_1_440px]"
    >
      <div className="absolute top-0 left-0 h-[290px] w-4/5 overflow-hidden rounded-[14px] border-[1.5px] border-edge bg-surface">
        <div className="flex items-center gap-2 border-b-[1.5px] border-edge px-3.5 py-2.5">
          <span className="size-2.5 rounded-full bg-edge-strong" />
          <span className="size-2.5 rounded-full bg-edge-strong" />
          <span className="size-2.5 rounded-full bg-edge-strong" />
          {/* A real input so visitors can click, delete or type, styled exactly like the old static label.
              The composition is aria-hidden, so it stays out of the keyboard tab order. */}
          <input
            type="text"
            defaultValue="localhost:5173"
            tabIndex={-1}
            spellCheck={false}
            autoComplete="off"
            className="ml-2.5 min-w-0 flex-1 rounded-md bg-canvas px-2.5 py-0.5 font-mono text-[0.72rem] text-subtle outline-none"
          />
        </div>
        <div className="flex flex-col gap-2.5 p-[18px]">
          <div className="h-3.5 w-[55%] rounded bg-edge" />
          <div className="h-2.5 w-4/5 rounded bg-line" />
          <div className="h-2.5 w-[70%] rounded bg-line" />
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            <div className="h-[70px] rounded-lg bg-raised" />
            <div className="h-[70px] rounded-lg bg-raised" />
            <div className="h-[70px] rounded-lg bg-raised" />
          </div>
        </div>
      </div>

      <div className="absolute top-[150px] left-[16%] w-4/5 overflow-hidden rounded-[14px] border-[1.5px] border-fg bg-surface font-mono text-[0.82rem] shadow-layer-lg">
        <div className="flex justify-between border-b-[1.5px] border-edge px-3.5 py-2.5 text-xs text-subtle">
          {/* Editable like the browser's address bar above; same look as the old static text. */}
          <input
            type="text"
            defaultValue="~/portfolio/backend"
            tabIndex={-1}
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 outline-none"
          />
          <span>zsh</span>
        </div>
        <div className="overflow-x-auto px-[18px] py-4 leading-[1.9] whitespace-nowrap">
          {/* The "$" prompt stays fixed; only the command is editable, like a real terminal. */}
          <div className="flex text-subtle">
            <span className="mr-[1ch]">$</span>
            <input
              type="text"
              defaultValue="npm run dev"
              tabIndex={-1}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 outline-none"
            />
          </div>
          {stack.map((tech) => (
            // Negative margin + matching padding: the hover highlight spans the full terminal width.
            <div
              key={tech}
              className="group -mx-[18px] px-[18px] transition-colors hover:bg-accent hover:text-canvas"
            >
              <span className="text-accent group-hover:text-canvas">✓</span> {tech}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-0 bottom-0 w-[56%] rotate-2 rounded-xl border-[1.5px] border-canvas bg-accent px-4 py-3 font-mono text-[0.8rem] text-canvas shadow-light">
        <div className="font-bold">socket · event received</div>
        <div>task:completed</div>
      </div>
    </div>
  );
}

export default Hero;
