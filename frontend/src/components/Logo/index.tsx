interface LogoProps {
  className?: string;
}

// "casq" wordmark drawn with square strokes and slab serifs, like an old typewriter.
// It needs no font and inherits the text color. Each letter sits on a 20-unit grid
// with a shared x-height (y 2 to 22); the q's tail drops to y 32.
function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      viewBox="-3 -1 132 37"
      fill="none"
      strokeWidth={4}
      strokeLinecap="square"
      strokeLinejoin="miter"
      role="img"
      aria-label="casq"
      className={className}
    >
      <g stroke="currentColor">
        <path d="M19 6V2H1V22H19V18" />
        <path transform="translate(28 0)" d="M2 2H17V22H21M17 12H2V22H17" />
        <path transform="translate(56 0)" d="M19 5V2H1V12H19V22H1V19" />
        <path transform="translate(84 0)" d="M17 2H1V22H17M17 2V32M13 32H21" />
      </g>
      <path className="stroke-accent" d="M113 22H125" />
    </svg>
  );
}

export default Logo;
