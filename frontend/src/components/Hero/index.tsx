function Hero() {
  return (
    <section id="home" className="flex scroll-mt-8 flex-wrap items-center gap-14 py-24">
      <div className="min-w-0 flex-[1_1_400px]">
        <p className="mb-6 inline-block rounded-full border-[1.5px] border-accent px-3.5 py-1.5 font-mono text-xs text-accent">
          ● available for projects
        </p>
        <h1 className="font-display text-5xl leading-[1.02] font-bold tracking-tighter sm:text-7xl">
          Full stack.
          <br />
          From the browser
          <br />
          <span className="text-accent">to the server.</span>
        </h1>
        <p className="mt-6 max-w-[480px] text-lg text-muted">
          I'm [your name]. [One or two sentences about what you build: React interfaces, Node APIs, real-time
          features and job queues.]
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

// Decorative composition: browser, terminal and socket notification layered on top of each other.
function StackedWindows() {
  return (
    <div aria-hidden="true" className="relative h-[470px] min-w-0 flex-[1_1_440px]">
      <div className="absolute top-0 left-0 h-[290px] w-4/5 overflow-hidden rounded-[14px] border-[1.5px] border-edge bg-surface">
        <div className="flex items-center gap-2 border-b-[1.5px] border-edge px-3.5 py-2.5">
          <span className="size-2.5 rounded-full bg-edge-strong" />
          <span className="size-2.5 rounded-full bg-edge-strong" />
          <span className="size-2.5 rounded-full bg-edge-strong" />
          <span className="ml-2.5 flex-1 rounded-md bg-canvas px-2.5 py-0.5 font-mono text-[0.72rem] text-subtle">
            localhost:5173
          </span>
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
          <span>~/portfolio/backend</span>
          <span>zsh</span>
        </div>
        <div className="overflow-x-auto px-[18px] py-4 leading-[1.9] whitespace-nowrap">
          <div className="text-subtle">$ npm run dev</div>
          <div>
            <span className="text-accent">✓</span> express on :3000
          </div>
          <div>
            <span className="text-accent">✓</span> redis connected
          </div>
          <div>
            <span className="text-accent">✓</span> worker "tasks" running
          </div>
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
