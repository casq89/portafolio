import type { ReactNode } from 'react';
import CaseHero from '../../components/CaseHero';
import FeatureRow from '../../components/FeatureRow';
import PhoneFan from '../../components/PhoneFan';
import PhonePair from '../../components/PhonePair';
import {
  invitationHomes,
  invitationHomesDisclaimer,
  invitationHomesFeatures,
  invitationHomesScreens as screens,
  type InvitationHomesFeatureId,
} from '../../data/invitationHomes';
import ArchitectureMockup from './components/ArchitectureMockup';
import MapMockup from './components/MapMockup';

const visuals: Record<InvitationHomesFeatureId, ReactNode> = {
  map: <MapMockup />,
  tours: <PhonePair shots={[screens.search, screens.tour]} />,
  residents: <PhonePair shots={[screens.checklist, screens.payments]} />,
  architecture: <ArchitectureMockup />,
};

// Case study of the Invitation Homes mobile app.
function InvitationHomes() {
  return (
    <>
      <CaseHero
        study={invitationHomes}
        visual={<PhoneFan shots={[screens.search, screens.cover, screens.payments]} badge="react native" />}
      />

      <div className="mb-16 divide-y-[1.5px] divide-line border-t-[1.5px] border-line">
        {invitationHomesFeatures.map((feature, index) => (
          <FeatureRow key={feature.id} feature={feature} reversed={index % 2 === 1} visual={visuals[feature.id]} />
        ))}
      </div>

      <p className="mb-16 max-w-[720px] font-mono text-xs text-subtle">{invitationHomesDisclaimer}</p>
    </>
  );
}

export default InvitationHomes;
