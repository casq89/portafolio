import type { ReactNode } from 'react';

interface WindowProps {
  title?: string;
  meta?: string;
  highlighted?: boolean;
  className?: string;
  children: ReactNode;
}

// Container with a title bar, like a terminal or editor window.
function Window({ title, meta, highlighted = false, className = '', children }: WindowProps) {
  const border = highlighted ? 'border-fg shadow-layer-lg' : 'border-edge';

  return (
    <div className={`overflow-hidden rounded-2xl border-[1.5px] bg-surface ${border} ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b-[1.5px] border-edge px-[18px] py-3 font-mono text-xs text-subtle">
        {title && <span>{title}</span>}
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </div>
  );
}

export default Window;
