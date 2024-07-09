import './globals.css';
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import ClientWrapper from './ClientWrapper';
import { AI } from './actions';
import { ReactNode } from 'react';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ overflowX: 'hidden' }}>
      <body className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
            style={{ overflowX: 'hidden', position: 'relative' }}>
        <AI>
          <ClientWrapper>
            <Header />
            <ToastProvider>
              <div style={{ overflowX: 'hidden' }}>
                {children}
                <ToastViewport />
              </div>
            </ToastProvider>
          </ClientWrapper>
        </AI>
      </body>
    </html>
  );
}