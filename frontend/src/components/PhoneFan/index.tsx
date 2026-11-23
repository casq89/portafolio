import type { Screenshot } from '../../data/caseStudy';
import PhoneShot from '../PhoneShot';

interface PhoneFanProps {
  /** Left, center (in front) and right screens. */
  shots: [Screenshot, Screenshot, Screenshot];
  /** Small tilted tag in the corner, e.g. "react native". */
  badge?: string;
}

// Three app screens fanned out, used in the case-study headers of mobile projects.
function PhoneFan({ shots, badge }: PhoneFanProps) {
  const [left, center, right] = shots;

  return (
    <div className="relative mx-auto aspect-[10/9] w-full max-w-[520px]">
      <PhoneShot shot={left} className="absolute top-[8%] left-0 w-[38%] -rotate-6 shadow-layer-sm" />
      <PhoneShot shot={right} className="absolute top-[8%] right-0 w-[38%] rotate-6 shadow-layer-sm" />
      <PhoneShot shot={center} className="absolute top-0 left-[30%] z-10 w-[40%]" />
      {badge && (
        <span className="absolute right-[6%] -bottom-2 z-20 rotate-3 rounded-lg border-[1.5px] border-canvas bg-accent px-2.5 py-0.5 font-mono text-[0.72rem] font-bold text-canvas">
          {badge}
        </span>
      )}
    </div>
  );
}

export default PhoneFan;
