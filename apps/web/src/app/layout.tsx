import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import '~/styles/globals.css';
import 'sonner/dist/styles.css'; // required as lib-injected styles are blocked by CSP
import { Toaster } from '~/components/ui/toast';
import { TelemetryProvider } from '~/telemetry/provider';
import { TRPCReactProvider } from '~/trpc/react';

export const viewport: Viewport = {
  themeColor: '#01321f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://playcards.games'),
  title: {
    default: 'Play Cards',
    template: '%s | Play Cards',
  },
  description:
    'Play multiplayer card games online with friends. Start a game and share the lobby link to invite them to join from their own device.',
  authors: [{ url: '/humans.txt' }],
  icons:
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='15' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='70'>♠</text></svg>",
  openGraph: {
    title: 'Play Cards',
    description:
      'Play multiplayer card games online with friends. Start a game and share the lobby link to invite them to join from their own device.',
    url: 'https://playcards.games',
    siteName: 'Play Cards',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://playcards.games/images/home.rectangle.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Cards',
    description:
      'Play multiplayer card games online with friends. Start a game and share the lobby link to invite them to join from their own device.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${GeistSans.variable}`}>
      <body className='bg-dark-green background-noise text-dark-text'>
        <TelemetryProvider />
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
