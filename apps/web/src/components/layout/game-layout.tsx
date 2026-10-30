import type { ReactNode } from 'react';
import { type GameType, gameDisplayName } from '~/types/game';
import { cn } from '~/utils/cn';
import { PageHeader, PageRoot } from './page';

type GameLayoutProps = {
  gameType: GameType;
  children: ReactNode;
  actions?: ReactNode;
  className?: string | undefined;
};

export default function GameLayout({
  gameType,
  children,
  actions,
  className,
}: GameLayoutProps) {
  return (
    // Fits the screen so the header stays in view, and main scrolls instead
    <PageRoot isScreenHeight>
      <PageHeader
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: gameDisplayName[gameType] },
        ]}
      >
        {actions}
      </PageHeader>

      <main
        className={cn(
          // Safe centring starts tall content at the top, so none is cut off
          'flex-1 min-h-0 w-full flex flex-col justify-center-safe overflow-y-auto',
          className,
        )}
      >
        {children}
      </main>
    </PageRoot>
  );
}
