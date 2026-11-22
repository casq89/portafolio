interface SectionHeaderProps {
  path: string;
  title: string;
  description?: string;
}

function SectionHeader({ path, title, description }: SectionHeaderProps) {
  return (
    <header className="mb-12">
      <p className="mb-2 font-mono text-sm text-accent">{path}</p>
      <h2 className="font-display text-4xl leading-none font-bold tracking-tight sm:text-5xl">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
    </header>
  );
}

export default SectionHeader;
