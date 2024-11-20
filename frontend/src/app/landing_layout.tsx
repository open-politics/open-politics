
import { ReactNode } from 'react';
import Footer from '@/components/Footer';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}