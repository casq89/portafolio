import { socialLinks } from '../../data/portfolio';

function Footer() {
  return (
    <footer className="border-t-[1.5px] border-edge p-6 text-center font-mono text-sm">
      <ul className="flex justify-center gap-6">
        {socialLinks.map((link) => (
          <li key={link.name}>
            <a href={link.url} className="text-muted transition-colors hover:text-fg">
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

export default Footer;
