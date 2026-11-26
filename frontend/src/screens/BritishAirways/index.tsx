import type { ReactNode } from 'react';
import CaseHero from '../../components/CaseHero';
import FeatureRow from '../../components/FeatureRow';
import PhoneFan from '../../components/PhoneFan';
import PhonePair from '../../components/PhonePair';
import {
  britishAirways,
  britishAirwaysDisclaimer,
  britishAirwaysFeatures,
  britishAirwaysScreens as screens,
  type BritishAirwaysFeatureId,
} from '../../data/britishAirways';
import ArchitectureMockup from './components/ArchitectureMockup';

const visuals: Record<BritishAirwaysFeatureId, ReactNode> = {
  architecture: <ArchitectureMockup />,
  booking: <PhonePair shots={[screens.booking, screens.manage]} />,
  dayOfTravel: <PhonePair shots={[screens.dayOfTravel, screens.liveActivity]} />,};

// Case study of the British Airways mobile app.
function BritishAirways() {
  return (
    <>
      <CaseHero
        study={britishAirways}
        visual={<PhoneFan shots={[screens.booking, screens.cover, screens.dayOfTravel]} badge="react native" />}
      />

      <div className="mb-16 divide-y-[1.5px] divide-line border-t-[1.5px] border-line">
        {britishAirwaysFeatures.map((feature, index) => (
          <FeatureRow key={feature.id} feature={feature} reversed={index % 2 === 1} visual={visuals[feature.id]} />
        ))}
      </div>

      <p className="mb-16 max-w-[720px] font-mono text-xs text-subtle">{britishAirwaysDisclaimer}</p>
    </>
  );
}

export default BritishAirways;
