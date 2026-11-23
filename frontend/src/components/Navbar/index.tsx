import { Link } from 'react-router';
import { cvUrl, navLinks } from '../../data/portfolio';
import Logo from '../Logo';

function Navbar() {
  return (
    <nav
      aria-label="Main"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border-[1.5px] border-edge bg-surface py-2.5 pr-3 pl-5 shadow-layer-md"
    >
      <Link to="/" aria-label="casq, back to home" className="py-2">
        <Logo className="h-7 w-auto text-fg" />
      </Link>

      <ul className="flex flex-wrap gap-x-6 font-mono text-sm">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="block py-2.5 text-muted transition-colors hover:text-fg">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={cvUrl}
        className="rounded-[10px] bg-accent px-[18px] py-2.5 font-semibold text-canvas transition-transform hover:-translate-y-0.5"
      >
        Download CV
      </a>
    </nav>
  );
}

export default Navbar;
