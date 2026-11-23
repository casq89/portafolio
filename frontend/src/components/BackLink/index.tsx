import { Link } from 'react-router';

interface BackLinkProps {
  /** Internal route to go back to, e.g. "/" or "/#projects". */
  to: string;
  /** Shell-style path shown after "cd", e.g. "~/projects". */
  path: string;
}

// Breadcrumb-style back link shown at the top of inner screens: "← cd ~/projects".
function BackLink({ to, path }: BackLinkProps) {
  return (
    <Link to={to} className="font-mono text-sm text-muted transition-colors hover:text-accent">
      ← cd {path}
    </Link>
  );
}

export default BackLink;
