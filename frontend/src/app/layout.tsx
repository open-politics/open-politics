import './globals.css';
import { cn } from "@/lib/utils";
import { fontSans, fontMono } from "@/lib/fonts";
import { ReactNode } from 'react';
import { AI } from './actions';
import ClientWrapper from './ClientWrapper';
import BlurredDots from '@/components/BlurredDots';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          <AI>
            <ClientWrapper>
              <BlurredDots />
              <Header />
              <ToastProvider>
                {children}
                <ToastViewport />
              </ToastProvider>
              <Footer />
            </ClientWrapper>
          </AI>
      </body>
    </html>
  );
}