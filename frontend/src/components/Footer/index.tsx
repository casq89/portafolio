import { profile, socialLinks } from '../../data/portfolio';

const year = new Date().getFullYear();

function Footer() {
  return (
    <footer className="border-t-[1.5px] border-edge p-6 text-center font-mono text-sm">
      <ul className="flex justify-center gap-6">
        {socialLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.url}
              {...(link.url.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
              className="text-muted transition-colors hover:text-fg"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-subtle">
        © {year} {profile.name}. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
