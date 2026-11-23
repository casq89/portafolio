import type { Screenshot } from '../../data/caseStudy';

interface PhoneShotProps {
  shot: Screenshot;
  className?: string;
}

// An app screenshot framed like a phone, with the site's offset shadow.
function PhoneShot({ shot, className = '' }: PhoneShotProps) {
  return (
    <div className={`overflow-hidden rounded-[26px] border-[1.5px] border-fg bg-surface shadow-layer ${className}`}>
      <img src={shot.src} alt={shot.alt} loading="lazy" className="block aspect-[480/1040] w-full object-cover" />
    </div>
  );
}

export default PhoneShot;
