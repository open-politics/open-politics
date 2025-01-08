
import { ReactNode } from 'react';
import Footer from '@/components/collection/Footer';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}