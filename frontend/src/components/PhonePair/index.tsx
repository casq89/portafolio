import type { Screenshot } from '../../data/caseStudy';
import PhoneShot from '../PhoneShot';

interface PhonePairProps {
  shots: [Screenshot, Screenshot];
}

// Two app screens side by side, the second one lower and slightly tilted.
function PhonePair({ shots }: PhonePairProps) {
  const [first, second] = shots;

  return (
    <div className="mx-auto flex max-w-[460px] items-start gap-6 px-2">
      <PhoneShot shot={first} className="w-1/2 -rotate-2" />
      <PhoneShot shot={second} className="mt-14 w-1/2 rotate-2" />
    </div>
  );
}

export default PhonePair;
