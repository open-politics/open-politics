import './globals.css';
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import ClientWrapper from './ClientWrapper';
import { AI } from './actions';
import { ReactNode } from 'react';
import FooterWrapper from '@/components/FooterWrapper';
import BlurredDots from '@/components/BlurredDots';
import { SelectedArticlesView } from '@/components/SelectedArticlesView';

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
            <BlurredDots />
            <div className="flex flex-col min-h-screen relative z-30">
              <Header />
              <main className="flex-grow relative z-20">
                <ToastProvider>
                  <div className="flex flex-col">
                    {children}
                    <ToastViewport />
                  </div>
                </ToastProvider>
              </main>
              <FooterWrapper />
            </div>
          </ClientWrapper>
        </AI>
      </body>
    </html>
  );
}
