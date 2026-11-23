import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import Footer from '../Footer';
import Navbar from '../Navbar';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { pathname, hash } = useLocation();

  // On every navigation, jump to the #section in the URL, or to the top of the new screen.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 pt-6">
        <Navbar />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
