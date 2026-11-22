import type { FormEvent } from 'react';
import { email } from '../../data/portfolio';

const fieldClass =
  'rounded-[10px] border-[1.5px] border-edge-strong bg-canvas p-3 font-sans text-base text-fg outline-none focus:border-accent';
const labelClass = 'flex flex-col gap-1.5 font-mono text-sm text-muted';

function Contact() {
  // TODO: send the message to the backend.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section id="contact" className="flex scroll-mt-8 flex-wrap items-start gap-10 pt-16 pb-28">
      <div className="min-w-0 flex-[1_1_320px] pt-3">
        <p className="mb-2 font-mono text-sm text-accent">~/contact</p>
        <h2 className="font-display text-4xl leading-none font-bold tracking-tight sm:text-6xl">Let's build something</h2>
        <p className="mt-5 max-w-[400px] text-muted">Got a project or an opening? Write to me and I'll get back to you soon.</p>
        <a
          href={`mailto:${email}`}
          className="mt-8 inline-block -rotate-3 rounded-xl border-[1.5px] border-canvas bg-accent px-[18px] py-3.5 font-mono text-sm font-bold text-canvas shadow-light"
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
          <input type="text" name="name" required className={fieldClass} />
        </label>
        <label className={labelClass}>
          email
          <input type="email" name="email" required className={fieldClass} />
        </label>
        <label className={labelClass}>
          message
          <textarea name="message" rows={4} required className={`${fieldClass} resize-y`} />
        </label>
        <button
          type="submit"
          className="cursor-pointer self-start rounded-[10px] border-[1.5px] border-canvas bg-accent px-[22px] py-3 font-semibold text-canvas shadow-light-sm transition-transform hover:-translate-y-0.5"
        >
          Send message
        </button>
      </form>
    </section>
  );
}

export default Contact;
