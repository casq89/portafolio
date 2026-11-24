import { useState, type FormEvent } from 'react';
import { email } from '../../../../data/portfolio';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const statusMessages: Record<Exclude<Status, 'idle'>, string> = {
  sending: 'Sending...',
  sent: "Thanks! Your message is on its way. I'll get back to you soon.",
  error: `Something went wrong. Please try again or write to ${email}.`,
};

const fieldClass =
  'rounded-[10px] border-[1.5px] border-edge-strong bg-canvas p-3 font-sans text-base text-fg outline-none focus:border-accent';
const labelClass = 'flex flex-col gap-1.5 font-mono text-sm text-muted';

function Contact() {
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="flex scroll-mt-8 flex-wrap items-start gap-10 pt-16 pb-28">
      <div className="min-w-0 flex-[1_1_320px] pt-3">
        <p className="mb-2 font-mono text-sm text-accent">~/contact</p>
        <h2 className="font-display text-4xl leading-none font-bold tracking-tight sm:text-6xl">Let's build something</h2>
        <p className="mt-5 max-w-[400px] font-mono text-muted">Got a project or an opening? Write to me and I'll get back to you soon.</p>
        <a
          href={`mailto:${email}`}
          className="mt-8 inline-block -rotate-3 rounded-xl border-[1.5px] border-canvas bg-accent px-[18px] py-3.5 font-mono text-sm font-bold text-on-accent shadow-light"
        >
          {email}
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5 rounded-2xl border-[1.5px] border-fg bg-surface p-6 shadow-layer-lg"
      >
        <label className={labelClass}>
          name
          <input type="text" name="name" required maxLength={100} className={fieldClass} />
        </label>
        <label className={labelClass}>
          email
          <input type="email" name="email" required maxLength={200} className={fieldClass} />
        </label>
        <label className={labelClass}>
          message
          <textarea name="message" rows={4} required maxLength={5000} className={`${fieldClass} resize-y`} />
        </label>
        {/* Honeypot: hidden from people, bots tend to fill it in. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="cursor-pointer self-start rounded-[10px] border-[1.5px] border-canvas bg-accent px-[22px] py-3 font-semibold text-on-accent shadow-light-sm transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
        >
          Send message
        </button>
        {status !== 'idle' && (
          <p role="status" className={`font-mono text-sm ${status === 'error' ? 'text-red-400' : 'text-muted'}`}>
            {statusMessages[status]}
          </p>
        )}
      </form>
    </section>
  );
}

export default Contact;
