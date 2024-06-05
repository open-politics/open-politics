import { ReactNode } from 'react';
import { AI } from '../actions';
import Header from "@/components/Header";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Header />
        <AI>{children}</AI>
      </body>
    </html>
  );
}
