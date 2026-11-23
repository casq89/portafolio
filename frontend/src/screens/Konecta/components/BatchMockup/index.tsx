import Window from '../../../../components/Window';

const crontab = [
  { schedule: '0 2 * * *', job: 'load_interactions.php' },
  { schedule: '30 3 * * *', job: 'sync_campaigns.sh' },
  { schedule: '0 6 * * 1-5', job: 'build_daily_reports.php' },
];

const log = ['load_interactions  done', 'sync_campaigns     done', 'build_daily_reports done'];

// Decorative mock of the crontab and the log of last night's batch run.
function BatchMockup() {
  return (
    <div aria-hidden="true">
      <Window title="~/kcrm/batch" meta="bash" highlighted>
        <div className="overflow-x-auto px-5 py-4 font-mono text-[0.8rem] leading-[1.9] whitespace-nowrap">
          <div className="text-subtle">$ crontab -l</div>
          {crontab.map((entry) => (
            <div key={entry.job}>
              <span className="inline-block w-28 text-accent">{entry.schedule}</span>
              {entry.job}
            </div>
          ))}
          <div className="mt-3 text-subtle">$ tail batch.log</div>
          {log.map((line) => (
            <div key={line}>
              <span className="text-accent">✓</span> {line}
            </div>
          ))}
          <div>
            <span className="text-subtle">$</span> <span className="animate-pulse text-accent">▍</span>
          </div>
        </div>
      </Window>
    </div>
  );
}

export default BatchMockup;
