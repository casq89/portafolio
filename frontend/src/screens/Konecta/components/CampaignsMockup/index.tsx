import Window from '../../../../components/Window';

const campaigns = [
  { name: 'Customer care', type: 'inbound', progress: 72, status: 'live' },
  { name: 'Retention', type: 'outbound', progress: 45, status: 'live' },
  { name: 'Collections', type: 'outbound', progress: 88, status: 'live' },
  { name: 'Tech support', type: 'inbound', progress: 30, status: 'paused' },
];

// Decorative mock of the campaigns board.
function CampaignsMockup() {
  return (
    <div aria-hidden="true">
      <Window title="kcrm · campaigns" meta="4 active" highlighted>
        <ul className="divide-y divide-line px-5 py-1 font-mono text-[0.8rem]">
          {campaigns.map((campaign) => (
            <li key={campaign.name} className="flex items-center gap-3 py-3">
              <span
                className={`w-[72px] shrink-0 rounded-md border-[1.5px] px-1.5 py-0.5 text-center text-[0.68rem] font-bold ${
                  campaign.type === 'inbound' ? 'border-accent text-accent' : 'border-fg text-fg'
                }`}
              >
                {campaign.type}
              </span>
              <span className="min-w-0 flex-1 truncate">{campaign.name}</span>
              <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-line sm:block">
                <span className="block h-full bg-accent" style={{ width: `${campaign.progress}%` }} />
              </span>
              <span className={`w-16 shrink-0 text-right whitespace-nowrap ${campaign.status === 'live' ? 'text-accent' : 'text-subtle'}`}>
                ● {campaign.status}
              </span>
            </li>
          ))}
        </ul>
      </Window>
    </div>
  );
}

export default CampaignsMockup;
