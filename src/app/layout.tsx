import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { siteInfo } from '@/constants/site-info';

// theme
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: siteInfo.metaInfo.title,
  description: siteInfo.metaInfo.description,
  keywords: siteInfo.metaInfo.keywords,
  openGraph: {
    title: siteInfo.ogInfo.title,
    description: siteInfo.ogInfo.description,
    images: [siteInfo.ogInfo.image],
    url: siteInfo.ogInfo.url,
  },
};

export const runtime = 'edge';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

      </body>
    </html>
  );
}
