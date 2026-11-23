import Window from '../../../../components/Window';

const bars = [58, 74, 49, 86, 67, 92, 71];

// Decorative mock of a DB2 report: the query on top, its chart below.
function ReportsMockup() {
  return (
    <div aria-hidden="true">
      <Window title="db2 · daily_report.sql" meta="0.42s" highlighted>
        <pre className="overflow-x-auto border-b-[1.5px] border-edge px-5 py-4 font-mono text-[0.78rem] leading-relaxed">
          <span className="text-accent">SELECT</span> campaign, <span className="text-accent">COUNT</span>(*) <span className="text-accent">AS</span> contacts
          {'\n'}
          <span className="text-accent">FROM</span> kcrm.interactions
          {'\n'}
          <span className="text-accent">WHERE</span> created_at {'>='} <span className="text-muted">CURRENT DATE</span> - <span className="text-muted">7 DAYS</span>
          {'\n'}
          <span className="text-accent">GROUP BY</span> campaign;
        </pre>
        <div className="px-5 py-5">
          <div className="flex h-28 items-end gap-2.5">
            {bars.map((height, index) => (
              <span
                key={index}
                className={`flex-1 rounded-t-md ${index === bars.length - 2 ? 'bg-accent' : 'bg-edge-strong'}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[0.68rem] text-subtle">
            <span>mon</span>
            <span>sun</span>
          </div>
        </div>
      </Window>
    </div>
  );
}

export default ReportsMockup;
