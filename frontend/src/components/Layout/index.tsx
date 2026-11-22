import type { ReactNode } from 'react';
import Footer from '../Footer';
import Navbar from '../Navbar';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
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
