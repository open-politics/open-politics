import LandingLayout from '../landing_layout';
import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <LandingLayout>{children}</LandingLayout>;
}