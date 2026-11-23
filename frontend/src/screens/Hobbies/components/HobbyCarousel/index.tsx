import { useRef, useState, type KeyboardEvent } from 'react';
import type { HobbyImage } from '../../../../data/hobbies';

interface HobbyCarouselProps {
  label: string;
  images: HobbyImage[];
}

// Horizontal scroll-snap carousel: swipe or scroll on the track, or jump with the dots below.
function HobbyCarousel({ label, images }: HobbyCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    // Wraps around at both ends, so the arrows are never disabled and never steal focus.
    const target = (index + images.length) % images.length;
    track?.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
  };

  // Left/right arrow keys move the carousel while focus is anywhere inside it.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(active + 1);
    }
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={handleKeyDown}>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-canvas [scrollbar-width:none]"
        >
          {images.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="h-full w-full flex-none snap-center object-contain"
            />
          ))}
        </div>

        <ArrowButton direction="previous" onClick={() => goTo(active - 1)} />
        <ArrowButton direction="next" onClick={() => goTo(active + 1)} />
      </div>

      <p className="sr-only" aria-live="polite">
        Image {active + 1} of {images.length}: {images[active]?.alt}
      </p>

      <div className="flex justify-center gap-2 py-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show image ${index + 1} of ${images.length}`}
            aria-current={index === active}
            className={`h-2 rounded-full transition-all ${
              index === active ? 'w-5 bg-accent' : 'w-2 bg-edge-strong hover:bg-subtle'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface ArrowButtonProps {
  direction: 'previous' | 'next';
  onClick: () => void;
}

// Round button over the image edge.
function ArrowButton({ direction, onClick }: ArrowButtonProps) {
  const side = direction === 'previous' ? 'left-3' : 'right-3';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'previous' ? 'Previous image' : 'Next image'}
      className={`absolute top-1/2 ${side} flex size-10 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-edge-strong bg-surface/85 font-mono text-lg text-fg backdrop-blur transition hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      <span aria-hidden="true">{direction === 'previous' ? '‹' : '›'}</span>
    </button>
  );
}

export default HobbyCarousel;
