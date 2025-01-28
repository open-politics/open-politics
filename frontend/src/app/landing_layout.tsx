
import { ReactNode } from 'react';
import Footer from '@/components/collection/Footer';
import { Announcement } from '@/components/collection/announcement';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}