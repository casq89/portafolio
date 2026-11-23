import Window from '../../../../components/Window';

const layers = [
  { name: 'React Native app', detail: 'iOS · Android', focus: true },
  { name: 'Node.js API', detail: 'business logic' },
  { name: 'AWS Lambda', detail: 'serverless functions' },
];

// Decorative diagram of the stack: app → API → Lambda, provisioned with Terraform.
function ArchitectureMockup() {
  return (
    <div aria-hidden="true">
      <Window title="architecture" meta="terraform" highlighted>
        <div className="flex gap-4 p-5">
          <ol className="flex flex-1 flex-col items-stretch">
            {layers.map((layer, index) => (
              <li key={layer.name} className="flex flex-col items-center">
                {index > 0 && <span className="py-1 font-mono text-subtle">↓</span>}
                <div
                  className={`relative w-full rounded-lg border-[1.5px] px-4 py-3 ${
                    layer.focus ? 'border-accent bg-accent/10' : 'border-edge-strong bg-raised'
                  }`}
                >
                  <p className="font-display font-bold">{layer.name}</p>
                  <p className="font-mono text-xs text-subtle">{layer.detail}</p>
                  {layer.focus && (
                    <span className="absolute -top-3 right-3 rotate-2 rounded-md border-[1.5px] border-canvas bg-accent px-2 py-px font-mono text-[0.68rem] font-bold text-on-accent">
                      my focus
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="flex w-10 flex-col items-center rounded-lg border-[1.5px] border-dashed border-edge-strong py-3">
            <span className="font-mono text-[0.68rem] text-subtle [writing-mode:vertical-rl]">terraform · infra as code</span>
          </div>
        </div>
        <pre className="overflow-x-auto border-t-[1.5px] border-edge px-5 py-4 font-mono text-[0.75rem] leading-relaxed">
          <span className="text-accent">resource</span> <span className="text-muted">"aws_lambda_function"</span> <span className="text-muted">"api"</span> {'{'}
          {'\n'}  runtime = <span className="text-muted">"nodejs"</span>
          {'\n'}  handler = <span className="text-muted">"index.handler"</span>
          {'\n'}
          {'}'}
        </pre>
      </Window>
    </div>
  );
}

export default ArchitectureMockup;
