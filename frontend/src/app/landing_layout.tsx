
import { ReactNode } from 'react';
import Footer from '@/components/collection/unsorted/Footer';
import { Announcement } from '@/components/collection/unsorted/announcement';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}