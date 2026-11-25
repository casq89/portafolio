import type { ReactNode } from 'react';
import CaseHero from '../../components/CaseHero';
import FeatureRow from '../../components/FeatureRow';
import { konecta, konectaFeatures, type KonectaFeatureId } from '../../data/konecta';
import CampaignsMockup from './components/CampaignsMockup';
import CoverWindow from './components/CoverWindow';
import ReportsMockup from './components/ReportsMockup';
import WhatsAppMockup from './components/WhatsAppMockup';

const visuals: Record<KonectaFeatureId, ReactNode> = {
  campaigns: <CampaignsMockup />,
  whatsapp: <WhatsAppMockup />,
  reports: <ReportsMockup />,
};

// Case study of the KCRM project at Konecta.
function Konecta() {
  return (
    <>
      <CaseHero study={konecta} visual={<CoverWindow />} />

      <div className="mb-16 divide-y-[1.5px] divide-line border-t-[1.5px] border-line">
        {konectaFeatures.map((feature, index) => (
          <FeatureRow key={feature.id} feature={feature} reversed={index % 2 === 1} visual={visuals[feature.id]} />
        ))}
      </div>
    </>
  );
}

export default Konecta;
