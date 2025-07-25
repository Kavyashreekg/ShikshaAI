import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { LanguageProvider } from '@/context/language-context';
import { StudentProvider } from '@/context/student-context';

export const metadata: Metadata = {
  title: 'ShikshaAI: Teaching Assistant',
  description: 'An AI-powered teaching assistant to empower teachers in multi-grade, low-resource environments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
            <StudentProvider>
              {children}
              <Toaster />
            </StudentProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
