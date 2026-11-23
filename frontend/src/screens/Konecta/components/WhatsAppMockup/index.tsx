import Window from '../../../../components/Window';

const messages = [
  { from: 'agent', text: 'Hi! This is the support team. How can we help you today?' },
  { from: 'customer', text: 'I need to update the address on my account.' },
  { from: 'agent', text: 'Sure. I just sent you a secure link to confirm it 👇' },
  { from: 'customer', text: 'Done, thanks!' },
];

// Decorative mock of a WhatsApp campaign conversation inside the CRM.
function WhatsAppMockup() {
  return (
    <div aria-hidden="true" className="relative">
      <Window title="whatsapp · campaign" meta="chat #2041" highlighted>
        <div className="flex flex-col gap-2.5 bg-canvas/40 px-5 py-5 text-[0.88rem]">
          {messages.map((message, index) => (
            <p
              key={index}
              className={`max-w-[80%] rounded-xl border-[1.5px] px-3.5 py-2 ${
                message.from === 'agent'
                  ? 'self-end rounded-br-sm border-canvas bg-accent text-on-accent'
                  : 'self-start rounded-bl-sm border-edge bg-raised'
              }`}
            >
              {message.text}
            </p>
          ))}
          <p className="self-start font-mono text-xs text-subtle">customer is typing…</p>
        </div>
      </Window>
      <span className="absolute -top-3.5 -left-3 -rotate-3 rounded-lg border-[1.5px] border-canvas bg-fg px-2.5 py-0.5 font-mono text-[0.72rem] font-bold text-canvas">
        linked to CRM record
      </span>
    </div>
  );
}

export default WhatsAppMockup;
