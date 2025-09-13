import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import '~/styles/globals.css';
import { Toaster } from '~/components/ui/toast';
import { TRPCReactProvider } from '~/trpc/react';

export const metadata: Metadata = {
  title: {
    default: 'Play Cards',
    template: '%s | Play Cards',
  },
  description: 'Multiplayer card games online',
  icons:
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='15' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='70'>♠</text></svg>",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      className={`${GeistSans.variable} bg-dark-red text-primary`}
    >
      <body className='bg-felt-texture'>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
